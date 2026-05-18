import mongoose from 'mongoose';
import { app } from '../server/src/app.js';
import { connectDb } from '../server/src/config/db.js';

let connectionPromise: Promise<void> | null = null;

const ensureDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;
  connectionPromise ??= connectDb();
  await connectionPromise;
};

export default async function handler(req: unknown, res: unknown) {
  await ensureDatabase();
  return app(req as never, res as never);
}
