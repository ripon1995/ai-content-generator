import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import logger from './utils/logger';
import { sendSuccess } from './utils/response';
import { httpLogger } from './middleware/api_logging';
import { errorHandler } from './middleware/error_handler';
import { authenticate } from './middleware/auth';
import apiRoutes from './routes';
import router from './routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// HTTP request logging
app.use(httpLogger);

// API Routes : public
app.use('/api', apiRoutes);


// API Routes : protected
router.use(authenticate);
app.get('/api/welcome', (req: Request, res: Response) => {
  logger.info(`Welcome endpoint accessed by user: ${req.user?.email}`);

  return sendSuccess(
    res,
    {
      status: 'Server is running',
      version: '1.0.0',
      user: {
        userId: req.user?.userId,
        email: req.user?.email,
      },
    },
    `Welcome to AI Content Generator API, ${req.user?.email}! 🚀`
  );
});



// Global Error Handler (must be after all routes)
app.use(errorHandler);

// Start server function
async function startServer() {
  try {
    // 1. Connect to database first
    await connectDatabase();

    // 2. Start Express server after database is connected
    app.listen(env.port, () => {
      logger.info(`🚀 Server running on http://localhost:${env.port}`);
      logger.info(`📡 API endpoint: http://localhost:${env.port}/api/welcome`);
      logger.info(`🌍 Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();