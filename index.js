const express = require('express');
const mongoose = require('mongoose');

const logger = require('./services/logger');

require('./services/error');
require('./services/config');

const app = express();

const MONGODB_URI =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/vidly';
mongoose
    .connect(MONGODB_URI, {
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        logger.info('Connected to MongoDB');
    });

require('./services/routes')(app);

const PORT = parseInt(process.env.PORT, 10) || 3000;
const server = app.listen(PORT, () => {
    logger.info('Listening on port: ', { message: PORT });
});

process.on('SIGTERM', () => {
    server.close((err) => {
        if (err) {
            throw err;
        }

        logger.info('Server has closed');
        mongoose.connection.close((err) => {
            if (err) {
                throw err;
            }

            logger.info('Disconnected from MongoDB');
            process.exit(0);
        });
    });
});

module.exports = server;
