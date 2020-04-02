const mongoose = require('mongoose');

const ClientError = require('../util/error').ClientError;

module.exports = function (req, res, next) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new ClientError(400, 'Invalid object id');
    }

    next();
};
