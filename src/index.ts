import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import 'reflect-metadata';
import errorHandler from './middleware/error';
import authRouter from './route/auth';
import customersRouter from './route/customers';
import genresRouter from './route/genres';
import moviesRouter from './route/movies';
import rentalsRouter from './route/rentals';
import returnsRouter from './route/returns';
import usersRouter from './route/users';

declare global {
  namespace Express {
    interface User {
      sub: string;
    }

    interface Request {
      user?: User | undefined;
    }
  }
}

process.on('uncaughtException', (error) => {
  console.log('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled rejection at:', promise, '\nReason:', reason);
  process.exit(1);
});

// Load .env file contents to process.env
const { error } = dotenv.config({ path: path.join(process.cwd(), '.env') });
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

app.use('/api/auth', authRouter);
app.use('/api/customers', customersRouter);
app.use('/api/genres', genresRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/rentals', rentalsRouter);
app.use('/api/returns', returnsRouter);
app.use('/api/users', usersRouter);

app.all('*', (req, res) => {
  res.sendStatus(405);
});

app.use(errorHandler);

console.log(`Starting in ${NODE_ENV} mode`);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(PORT, () => {
  console.log(`Listening on port :${PORT}`);
});
