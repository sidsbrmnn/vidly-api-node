const logger = require('../services/logger');

module.exports = function (err, req, res, next) {
    switch (err.name) {
        case 'ClientError':
            res.status(err.statusCode).send({ error: err.message });
            break;

        default:
            if (process.env.NODE_ENV !== 'production') {
                logger.error(err);
            }
            res.status(500).send({ error: 'Something went wrong' });
            break;
    }

    next();
};
