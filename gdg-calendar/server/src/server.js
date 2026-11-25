import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { startRemindersJob } from './jobs/reminders.job.js';
import { initSockets } from './sockets/index.js';

async function start() {
  await connectDB();
  const server = http.createServer(app);
  const io = initSockets(server);
  app.set('io', io);
  if (env.nodeEnv !== 'test') {
    startRemindersJob();
  }
  server.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

