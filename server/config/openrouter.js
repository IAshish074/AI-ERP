const { OpenAI } = require('openai');
require('dotenv').config();

const openrouter = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || 'placeholder_openrouter_key',
  defaultHeaders: {
    'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
    'X-Title': 'AI Native ERP'
  }
});

module.exports = openrouter;
