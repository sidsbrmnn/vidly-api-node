import jwt from 'express-jwt';

/**
 * Middleware that checks for Authorization header and validates the session by
 * verifying the JSON Web Token and attaches the decoded object to req.user.
 */
export default jwt({
  secret: process.env.JWT_SECERT || 'shh-secret',
  algorithms: ['HS256'],
});
