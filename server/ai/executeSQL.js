const vanna = require('../config/vanna');

/**
 * Executes a PostgreSQL SELECT query on the Supabase database
 * @param {string} sql The SQL query to execute
 * @returns {Promise<Array>} The query result rows
 */
async function executeSQL(sql) {
  if (!sql || typeof sql !== 'string') {
    throw new Error('SQL query must be a non-empty string.');
  }
  return await vanna.executeSQL(sql);
}

module.exports = executeSQL;
