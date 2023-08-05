const { BAD_REQUEST_ERROR } = require('../constants/HHTP-status-codes');

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = BAD_REQUEST_ERROR;
  }
}

module.exports = BadRequestError;
