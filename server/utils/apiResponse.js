class ApiResponse {
  constructor(statusCode, data, message = 'Success', success = true) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = success;
  }

  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message, true));
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, errors = []) {
    return res.status(statusCode).json({
      statusCode,
      success: false,
      message,
      errors
    });
  }
}

module.exports = ApiResponse;
