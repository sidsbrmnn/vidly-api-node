class HttpError extends Error {
  /**
   *
   * @param {number} status
   * @param {string} message
   */
  constructor(status, message) {
    super(message);
    this.status = status;

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

module.exports = HttpError;
