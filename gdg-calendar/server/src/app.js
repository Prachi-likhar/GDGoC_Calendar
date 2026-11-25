import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { authRateLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/ApiError.js';
import analyticsRoutes from './routes/analytics.routes.js';
import authRoutes from './routes/auth.routes.js';
import blockedDateRoutes from './routes/blockedDate.routes.js';
import eventRoutes from './routes/event.routes.js';
import publicRoutes from './routes/public.routes.js';
import sessionRoutes from './routes/session.routes.js';
import taskRoutes from './routes/task.routes.js';
import templateRoutes from './routes/template.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/blocked-dates', blockedDateRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public', publicRoutes);

app.use((req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

app.use(errorHandler);

export default app;

