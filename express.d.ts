declare namespace Express {
  interface Request {
    user?: import('.').TokenPayload;
  }
}
