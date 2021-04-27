const compression = require('compression');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
require('express-async-errors');
const helmet = require('helmet');
const path = require('path');
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
const { error } = dotenv.config({ path: path.join(__dirname, '.env') });
if (error) {
  throw error;
}

const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({ credentials: true }));

// Setup production-only middlewares
if (NODE_ENV === 'production') {
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

console.log(`Starting in ${NODE_ENV} mode`);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(PORT, () => {
  console.log(`Listening on port :${PORT}`);
});
