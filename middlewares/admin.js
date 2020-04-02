const ClientError = require('../util/error').ClientError;

module.exports = function (req, res, next) {
    const isAdmin = res.locals.user.isAdmin;
    if (!isAdmin) {
        throw new ClientError(403, 'Permission denied');
    }

    next();
};
