const vanna = require('../config/vanna');

/**
 * Translates a natural language question into PostgreSQL SQL
 * @param {string} question The user question
 * @returns {Promise<string>} The generated SQL query
 */
async function generateSQL(question) {
  if (!question || typeof question !== 'string') {
    throw new Error('Question must be a non-empty string.');
  }
  return await vanna.generateSQL(question);
}

module.exports = generateSQL;
