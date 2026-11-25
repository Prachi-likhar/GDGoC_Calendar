import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(uri = env.mongoUri) {
  if (!uri) {
    throw new Error('MONGO_URI is required');
  }
  await mongoose.connect(uri);
  return mongoose.connection;
}

