class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export default HttpError;
