const jwt = require('jsonwebtoken');

const ClientError = require('../util/error').ClientError;

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        throw new ClientError(401, 'Please login to continue');
    }

    try {
        const secretKey = process.env.JWT_SECRET || 'some_secret';
        const decoded = jwt.verify(token, secretKey);
        res.locals.user = decoded;

        next();
    } catch (error) {
        throw new ClientError(400, 'Invalid token. Please login again');
    }
};
