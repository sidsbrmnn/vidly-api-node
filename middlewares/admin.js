const HttpError = require('../utils/http-error');

/**
 * Middlware that checks if the role of the logged user is 'admin' or not.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
module.exports = function (req, res, next) {
  if (req.user.role !== 'admin') {
    throw new HttpError(403, "You're not authorized further");
  }

  next();
};
