const { JsonWebTokenError } = require('jsonwebtoken');
const HttpError = require('../utils/http-error');

/**
 * Middleware that handles all the errors thrown inside an Express middleware
 * or request handler and responds with the appropriate status code/message.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
module.exports = function (err, req, res, next) {
  if (process.env.NODE_ENV === 'production' && !req.xhr) {
    return next(err);
  }

  if (err instanceof HttpError) {
    res.status(err.status).send({ message: err.message });
  } else if (err instanceof JsonWebTokenError) {
    res.status(401).send({ message: err.message });
  } else {
    res.status(500).send({ message: 'Something went wrong' });
  }
};
