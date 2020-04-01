const ClientError = require('../util/error').ClientError;
const jwt = require('../util/jwt');

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        throw new ClientError(401, 'Please login to continue');
    }

    try {
        const decoded = jwt.verify(token);
        res.locals.user = decoded;

        next();
    } catch (error) {
        throw new ClientError(400, 'Invalid token. Please login again');
    }
};
