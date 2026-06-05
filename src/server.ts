import { exec } from 'child_process';
import app from './app';

const PORT = process.env.PORT || 3000;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`[Server] Spur Support Backend is running on port ${PORT}`);
  });
};

if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  console.log('[Server] Production/Render environment detected. Synchronizing database schema...');
  exec('node node_modules/prisma/build/index.js db push', (error, stdout, stderr) => {
    if (error) {
      console.error('[Server] Database synchronization failed:', error);
      console.error(stderr);
    } else {
      console.log('[Server] Database synchronized successfully.');
      console.log(stdout);
    }
    startServer();
  });
} else {
  startServer();
}
