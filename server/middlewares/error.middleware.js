const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Global Error Handling Middleware
 */
const errorMiddleware = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  return ApiResponse.error(res, message, statusCode, errors);
};

module.exports = errorMiddleware;
