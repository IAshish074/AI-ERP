const supabase = require('./supabase');
const typesense = require('./typesense');
const openrouter = require('./openrouter');

class VannaClient {
  constructor() {
    this.supabase = supabase;
    this.typesense = typesense;
    this.openrouter = openrouter;
    this.collectionName = 'vanna_context';
  }

  /**
   * Initializes the Typesense collections needed for Vanna training storage
   */
  async initializeCollections() {
    try {
      const collections = await this.typesense.collections().retrieve();
      const exists = collections.some(col => col.name === this.collectionName);

      if (!exists) {
        console.log(`Creating Typesense collection: ${this.collectionName}`);
        const schema = {
          name: this.collectionName,
          fields: [
            { name: 'id', type: 'string' },
            { name: 'type', type: 'string', facet: true },
            { name: 'content', type: 'string' },
            { name: 'embedding', type: 'float[]', num_dim: 1536 },
            { name: 'metadata', type: 'string', optional: true }
          ]
        };
        await this.typesense.collections().create(schema);
        console.log(`Typesense collection ${this.collectionName} created successfully.`);
      }
    } catch (error) {
      console.error('Error initializing Typesense collection:', error);
    }
  }

  /**
   * Generates a vector embedding using OpenRouter
   */
  async getEmbedding(text) {
    try {
      // Use OpenRouter compatible embeddings endpoint
      const response = await this.openrouter.embeddings.create({
        model: 'openai/text-embedding-3-small', // Recommended model for 1536 dimensions
        input: text
      });
      return response.data[0].embedding;
    } catch (error) {
      console.warn('OpenRouter Embeddings API failed. Using fallback mock vector.');
      // Fallback: Return a simple deterministic vector of 1536 dimensions
      // This allows the system to run in development even without internet/keys
      const mockVector = Array(1536).fill(0);
      // Hash a bit of text to make it slightly distinct
      if (text) {
        for (let i = 0; i < text.length && i < 1536; i++) {
          mockVector[i] = text.charCodeAt(i) / 255.0;
        }
      }
      return mockVector;
    }
  }

  /**
   * Trains Vanna by storing schema definitions, documentation, or SQL queries as embeddings
   */
  async train({ type, content, metadata = {} }) {
    await this.initializeCollections();

    try {
      const embedding = await this.getEmbedding(content);
      const docId = `${type}_${Buffer.from(content.substring(0, 20)).toString('hex')}_${Date.now().toString().slice(-4)}`;

      const document = {
        id: docId,
        type,
        content,
        embedding,
        metadata: JSON.stringify(metadata)
      };

      await this.typesense.collections(this.collectionName).documents().upsert(document);
      console.log(`Vanna trained successfully. Type: ${type}, ID: ${docId}`);
      return docId;
    } catch (error) {
      console.error(`Failed to train Vanna:`, error);
      throw error;
    }
  }

  /**
   * Generates SQL from a natural language question using RAG on stored context
   */
  async generateSQL(question) {
    await this.initializeCollections();

    // 1. Get embedding for the question
    const questionEmbedding = await this.getEmbedding(question);

    // 2. Query Typesense for most relevant trained context
    let contextDocuments = [];
    try {
      const searchResponse = await this.typesense
        .collections(this.collectionName)
        .documents()
        .search({
          q: '*',
          vector_query: `embedding:([${questionEmbedding.join(',')}], k:7)`,
          per_page: 7
        });

      contextDocuments = searchResponse.hits.map(hit => hit.document);
    } catch (error) {
      console.error('Error searching Typesense context:', error);
    }

    // If no context was found, search by text match as a backup
    if (contextDocuments.length === 0) {
      try {
        const textSearch = await this.typesense
          .collections(this.collectionName)
          .documents()
          .search({
            q: question,
            query_by: 'content',
            per_page: 5
          });
        contextDocuments = textSearch.hits.map(hit => hit.document);
      } catch (error) {
        console.error('Text search backup failed:', error);
      }
    }

    // 3. Construct LLM prompt
    const ddlContext = contextDocuments
      .filter(doc => doc.type === 'ddl')
      .map(doc => doc.content)
      .join('\n\n');

    const sqlContext = contextDocuments
      .filter(doc => doc.type === 'sql')
      .map(doc => `Question: ${JSON.parse(doc.metadata).question || ''}\nSQL: ${doc.content}`)
      .join('\n\n');

    const docContext = contextDocuments
      .filter(doc => doc.type === 'doc')
      .map(doc => doc.content)
      .join('\n\n');

    const systemPrompt = `You are an expert SQL Generator for PostgreSQL database. 
Your goal is to output a clean, valid PostgreSQL query that answers the user's question based on the provided database context.

DATABASE SCHEMA CONTEXT (DDL):
${ddlContext || 'No DDL context available.'}

DOCUMENTATION CONTEXT:
${docContext || 'No documentation context available.'}

EXAMPLE SQL QUERIES:
${sqlContext || 'No example SQL queries available.'}

RULES:
1. Return ONLY valid PostgreSQL SQL code.
2. DO NOT wrap the code in markdown blocks like \`\`\`sql. Just return raw text.
3. Only use tables and columns defined in the DDL.
4. Use PostgreSQL-compatible syntax. Use ILIKE for case-insensitive string matches.
5. All references to UUID columns should be treated as UUID type.
6. For queries involving monetary amounts, check "price", "total_amount", "amount_due". Note that rupee currency is represented as numbers (e.g. ₹900 -> 900).
7. If the user query cannot be fulfilled with the current schema, output a comment like: -- ERROR: Schema doesn't support this query.
8. NEVER perform modifications (INSERT, UPDATE, DELETE, DROP, ALTER). Only SELECT queries are permitted.`;

    const userPrompt = `Generate a SQL query to answer the question: "${question}"`;

    try {
      const response = await this.openrouter.chat.completions.create({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1
      });

      let generatedSQL = response.choices[0].message.content.trim();
      
      // Sanitization: Remove markdown code block symbols if LLM included them
      if (generatedSQL.startsWith('```')) {
        generatedSQL = generatedSQL.replace(/^```(sql)?/i, '').replace(/```$/, '').trim();
      }
      
      return generatedSQL;
    } catch (error) {
      console.error('Error generating SQL via OpenRouter:', error);
      throw error;
    }
  }

  /**
   * Executes the generated SQL query in Supabase via RPC
   */
  async executeSQL(sql) {
    try {
      // Call the exec_sql RPC function we defined in schema.sql
      const { data, error } = await this.supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        console.error('Supabase SQL Execution RPC Error:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error executing SQL query:', error);
      throw error;
    }
  }

  /**
   * Formulates a natural language explanation of the SQL query results
   */
  async generateAnswer(question, sql, rows) {
    const prompt = `You are an AI ERP assistant that helps business managers analyze data. 
You are given a user's question, the SQL query executed, and the raw JSON results from the database.
Provide a clear, natural language answer summarizing the data for the user. Do not explain the SQL query itself, just answer the question based on the data.

User Question: "${question}"
Executed SQL: "${sql}"
Database Results:
${JSON.stringify(rows, null, 2)}

Provide a user-friendly, professional response. If no rows are returned, clearly state that no records match the criteria. Make sure to format currency in Indian Rupees (₹) where relevant.`;

    try {
      const response = await this.openrouter.chat.completions.create({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating answer via OpenRouter:', error);
      return 'I was able to run the query, but encountered an error formulating a natural language response.';
    }
  }
}

module.exports = new VannaClient();
