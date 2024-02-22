const errorConstants = require("../constants/errorConstants");
class AppError extends Error {
  constructor(code, message) {
    super(code, message);
    this.code = code;
    this.message = message;
  }
}
class InternalError extends Error {
  constructor(code, message) {
    super(code, message);
    this.code = code;
    this.message = message;
  }
}

module.exports = { AppError, InternalError };
