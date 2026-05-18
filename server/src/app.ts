import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { leadRouter } from './routes/lead.routes.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

export const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === env.clientUrl || origin.endsWith('.vercel.app')) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Smart Leads API is healthy' });
});

app.use('/api/auth', authRouter);
app.use('/api/leads', leadRouter);

app.use(notFound);
app.use(errorHandler);
