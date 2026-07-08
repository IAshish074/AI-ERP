const generateSQL = require('../ai/generateSQL');
const executeSQL = require('../ai/executeSQL');
const answerGenerator = require('../ai/answerGenerator');

class AiService {
  async askQuestion(question) {
    try {
      console.log(`Processing AI request: "${question}"`);

      // 1. Generate SQL
      const generatedSQL = await generateSQL(question);
      console.log(`Generated SQL: ${generatedSQL}`);

      // 2. Execute SQL
      let rows = [];
      let executionError = null;

      try {
        rows = await executeSQL(generatedSQL);
      } catch (err) {
        console.error('SQL Execution failed:', err.message);
        executionError = err.message;
      }

      // 3. Generate Natural Language Answer
      let answer = '';
      if (executionError) {
        answer = `I generated the SQL query: \`${generatedSQL}\`, but encountered an error running it on the database: ${executionError}. Please check your database tables.`;
      } else {
        answer = await answerGenerator(question, generatedSQL, rows);
      }

      return {
        question,
        generatedSQL,
        rows,
        answer
      };
    } catch (error) {
      console.error('Error in AiService.askQuestion:', error);
      throw error;
    }
  }
}

module.exports = new AiService();
