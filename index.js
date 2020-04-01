const express = require('express');
const mongoose = require('mongoose');

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
        console.log('Connected to MongoDB');
    });

require('./services/routes')(app);

const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, () => {
    console.log('Listening on port:', PORT);
});
