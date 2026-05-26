import express from 'express';
import cors from 'cors';
import { router } from './routes/index.js';
import { errorMiddleware } from './middlewares/error.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/v1', router);

  app.use(errorMiddleware);

  return app;
}

export const app = createApp();
