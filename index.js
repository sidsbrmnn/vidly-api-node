const compression = require('compression');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
require('express-async-errors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const morgan = require('morgan');

process.on('uncaughtException', (err) => {
  console.log('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled rejection at:', promise, '\nReason:', reason);
  process.exit(1);
});

// Load .env file contents to process.env
dotenv.config();

const IS_PROD = process.env.NODE_ENV === 'production';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(morgan(IS_PROD ? 'combined' : 'dev'));
app.use(cors({ credentials: true }));

// Setup production-only middlewares
if (IS_PROD) {
  app.use(helmet());
  app.use(compression());
}

app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/genres', require('./routes/genres'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/rentals', require('./routes/rentals'));
app.use('/api/returns', require('./routes/returns'));
app.use('/api/users', require('./routes/users'));

app.use(require('./middlewares/error'));

/**
 * @type {import('http').Server}
 */
let server;

(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  server = app.listen(PORT, () => {
    console.log(`Listening on port :${PORT}`);
  });
})();

process.on('SIGTERM', () => {
  server.close(async (err) => {
    if (err) {
      throw err;
    }

    console.log('Server has closed');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

    process.exit(0);
  });
});

module.exports = server;
