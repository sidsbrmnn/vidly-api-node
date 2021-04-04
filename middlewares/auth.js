const jwt = require('jsonwebtoken');
const HttpError = require('../utils/http-error');

/**
 * Middleware that checks for Authorization header and validates the session by
 * verifying the JSON Web Token and attaches the decoded object to req.user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
module.exports = function (req, res, next) {
  const value = req.headers.authorization;
  if (!value) {
    throw new HttpError(401, 'No session found. Please login.');
  }

  const parts = value.split(' ');
  if (parts.length !== 2 || !/^Bearer$/.test(parts[0])) {
    throw new HttpError(400, 'Invalid authorization header format.');
  }

  /**
   * @type {{iat: number; name: string; role: string; sub: string}}
   */
  const decoded = jwt.verify(parts[1], process.env.JWT_SECRET);
  req.user = decoded;
  next();
};
