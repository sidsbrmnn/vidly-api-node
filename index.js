const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api/genres', require('./routes/genres'));

const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, () => {
    console.log('Listening on port:', PORT);
});
