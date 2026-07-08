const ApiResponse = require('../utils/apiResponse');

/**
 * Validates request data against a Zod schema
 * @param {object} schema Zod validation schema
 * @param {string} source Source of request data ('body', 'query', 'params')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      req[source] = schema.parse(req[source]);
      next();
    } catch (error) {
      const errorDetails = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return ApiResponse.error(
        res, 
        'Validation failed', 
        400, 
        errorDetails
      );
    }
  };
};

module.exports = validate;
