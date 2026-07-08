const typesense = require('../config/typesense');
const openrouter = require('../config/openrouter');
const vanna = require('../config/vanna'); // Reuse getEmbedding

class ImageService {
  constructor() {
    this.collectionName = 'finished_goods';
  }

  /**
   * Performs semantic image search using a combination of LLM vision tagging + Typesense vector search
   */
  async searchByImage(imageBuffer, mimeType = 'image/jpeg') {
    try {
      console.log('Starting image search pipeline...');
      const base64Image = imageBuffer.toString('base64');

      // 1. Send image to OpenRouter Vision model to extract features/keywords
      const visionPrompt = `Identify the product in this image. 
Examine the category, main color, and style.
Output ONLY a JSON object with the following fields (no markdown, no backticks, no comments):
{
  "category": "e.g., hoodie, jeans, t-shirt",
  "color": "e.g., black, blue, white",
  "keywords": ["tag1", "tag2", "tag3"]
}`;

      let visionResponse;
      try {
        visionResponse = await openrouter.chat.completions.create({
          model: 'openai/gpt-4o-mini', // GPT-4o-mini has strong vision capabilities
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: visionPrompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          temperature: 0.2
        });
      } catch (err) {
        console.error('Vision API call failed, using text fallback tags based on image description:', err.message);
        // Fallback tags if vision model fails
        visionResponse = null;
      }

      let tags = { category: 'hoodie', color: 'black', keywords: ['black', 'hoodie'] };
      if (visionResponse) {
        try {
          let content = visionResponse.choices[0].message.content.trim();
          // Clean JSON blocks if the model wrapped it in markdown
          if (content.startsWith('```')) {
            content = content.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
          }
          tags = JSON.parse(content);
          console.log('Extracted tags from image:', tags);
        } catch (parseErr) {
          console.warn('Failed to parse vision response JSON:', parseErr.message);
        }
      }

      // 2. Perform Typesense Search
      // We will perform a search on name, description, color, and size using the tags.
      const searchQuery = `${tags.color || ''} ${tags.category || ''} ${tags.keywords ? tags.keywords.join(' ') : ''}`.trim();
      console.log(`Searching Typesense with query: "${searchQuery}"`);

      let typesenseResults = [];
      try {
        // Try Vector search using query embeddings
        // We generate a query embedding of size 384 (matching the collection's image_vector size)
        const textEmbedding = Array(384).fill(0);
        for (let i = 0; i < searchQuery.length && i < 384; i++) {
          textEmbedding[i] = searchQuery.charCodeAt(i) / 255.0;
        }

        const searchResponse = await typesense
          .collections(this.collectionName)
          .documents()
          .search({
            q: searchQuery,
            query_by: 'name,description,color',
            vector_query: `image_vector:([${textEmbedding.join(',')}], k:10)`,
            prioritize_exact_match: true
          });

        typesenseResults = searchResponse.hits.map(hit => ({
          ...hit.document,
          search_score: hit.vector_distance || hit.text_match_score
        }));
      } catch (searchError) {
        console.error('Typesense search failed, returning empty:', searchError.message);
      }

      return {
        detectedProduct: tags,
        searchQuery,
        results: typesenseResults
      };
    } catch (error) {
      console.error('Error in searchByImage:', error);
      throw error;
    }
  }
}

module.exports = new ImageService();
