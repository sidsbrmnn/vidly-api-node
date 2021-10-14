import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from 'express-jwt';
import { ValidationError } from 'yup';
import HttpError from '../util/http-error';

/**
 * Middleware that handles all the errors thrown inside an Express middleware
 * or request handler and responds with the appropriate status code/message.
 */
export default function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (process.env.NODE_ENV === 'production' && !req.xhr) {
    return next(err);
  }

  if (err instanceof HttpError) {
    res.status(err.status).send({ error_description: err.message });
  } else if (err instanceof UnauthorizedError) {
    res.status(err.status).send({
      error: err.code,
      error_description: err.message,
    });
  } else if (err instanceof ValidationError) {
    res.status(400).send({
      error: 'request_bad_format',
      error_description: err.message,
    });
  } else {
    console.log(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
}
