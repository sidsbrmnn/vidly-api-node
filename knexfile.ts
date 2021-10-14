import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

export = {
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  pool: { min: 2, max: 10 },
};
