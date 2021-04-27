const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

module.exports = {
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  pool: { min: 2, max: 10 },
};
