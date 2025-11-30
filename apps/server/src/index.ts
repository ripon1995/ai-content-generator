import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import logger from './utils/logger';
import { httpLogger } from './middleware/api_logging';
import { errorHandler } from './middleware/error_handler';
import apiRoutes from './routes';
import { createSocketServer } from './config/socket';
import { socketService } from './services/socket_service';
import { pubSubService } from './services/pubsub_service';
import { setupPubSubSubscriptions, setupGracefulShutdown } from './config/server';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// HTTP request logging
app.use(httpLogger);

// API Routes : root
app.use('/api', apiRoutes);

// Global Error Handler (must be after all routes)
app.use(errorHandler);

// Start server function
async function startServer() {
  try {
    // 1. Connect to database first
    await connectDatabase();

    // 2. Initialize Socket.IO
    const io = createSocketServer(httpServer);
    socketService.initialize(io);
    logger.info('✅ Socket.IO initialized');

    // 3. Initialize Redis Pub/Sub and subscribe to events
    pubSubService.initialize();
    await setupPubSubSubscriptions();
    logger.info('✅ Redis Pub/Sub subscriptions initialized');

    // 4. Start HTTP server with Socket.IO
    httpServer.listen(env.port, () => {
      logger.info(`🚀 Server running on http://localhost:${env.port}`);
      logger.info(`📡 API endpoint: http://localhost:${env.port}/api/welcome`);
      logger.info(`🔌 WebSocket server ready`);
      logger.info(`📮 Redis Pub/Sub ready`);
      logger.info(`🌍 Environment: ${env.nodeEnv}`);
    });

    // 5. Setup graceful shutdown
    setupGracefulShutdown(httpServer);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
