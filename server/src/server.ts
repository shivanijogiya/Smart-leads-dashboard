import { app } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';

const start = async (): Promise<void> => {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}`);
  });
};

void start().catch((error) => {
  console.error(error);
  process.exit(1);
});
