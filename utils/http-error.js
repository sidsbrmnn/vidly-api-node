class HttpError extends Error {
  /**
   *
   * @param {number} statusCode
   * @param {string} message
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

module.exports = HttpError;
