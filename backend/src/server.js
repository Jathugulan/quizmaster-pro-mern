import app from './app.js';
import { connectDB } from './config/database.js';
import { ENV } from './config/env.js';
import { seedDefaultCategories } from './services/categoryService.js';
import { seedSampleAttemptsAndActivity } from './seed/seedAttempts.js';

const startServer = async () => {
  // Connect to database
  await connectDB();
  await seedDefaultCategories();
  await seedSampleAttemptsAndActivity();

  // Start HTTP server
  const server = app.listen(ENV.PORT, () => {
    console.log(`[Server] QuizMaster Backend running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
    console.log(`[Server] API endpoints available at: http://localhost:${ENV.PORT}/api`);
    console.log(`[Server] Health check: http://localhost:${ENV.PORT}/api/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server Error] Port ${ENV.PORT} is already in use. Please close the process using port ${ENV.PORT} or choose a different port.`);
      process.exit(1);
    } else {
      console.error('[Server Error]', err);
    }
  });

  // Handle unhandled promise rejections gracefully
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection] ${err.message}`);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error(`[Uncaught Exception] ${err.message}`);
  });
};

startServer();
