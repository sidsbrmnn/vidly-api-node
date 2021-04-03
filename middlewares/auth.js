const jwt = require('jsonwebtoken');
const User = require('../models/user');
const HttpError = require('../utils/http-error');

/**
 * Middleware that checks for Authorization header and validates the session by
 * verifying the JSON Web Token and attaches the decoded object to req.user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
module.exports = async function (req, res, next) {
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
  const user = await User.findOne({ _id: decoded.sub });
  if (!user) {
    throw new HttpError(401, 'Invalid session. Please login again.');
  }

  req.user = decoded;
  next();
};
