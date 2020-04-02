const ClientError = require('../util/error').ClientError;
const jwt = require('../util/jwt');

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        throw new ClientError(401, 'Please login to continue');
    }

    const decoded = jwt.verify(token);
    res.locals.user = decoded;

    next();
};
