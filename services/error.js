require('express-async-errors');

const logger = require('./logger');

process.on('uncaughtException', (error) => {
    logger.error(error);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error(reason);
    process.exit(1);
});
