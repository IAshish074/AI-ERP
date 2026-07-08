const vanna = require('../config/vanna');

/**
 * Formulates a natural language answer from query results
 * @param {string} question The original user question
 * @param {string} sql The SQL query executed
 * @param {Array} rows The SQL query result rows
 * @returns {Promise<string>} The natural language answer
 */
async function answerGenerator(question, sql, rows) {
  return await vanna.generateAnswer(question, sql, rows);
}

module.exports = answerGenerator;
