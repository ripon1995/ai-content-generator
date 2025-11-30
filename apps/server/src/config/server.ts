import logger from '../utils/logger';
import { socketService } from '../services/socket_service';
import { pubSubService } from '../services/pubsub_service';

// Setup Redis Pub/Sub subscriptions to listen for worker events
export async function setupPubSubSubscriptions() {
  await pubSubService.subscribeToAllChannels({
    onStarted: (message) => {
      logger.info(
        `Received generation started event for user ${message.userId}, content: ${message.payload.contentId}`
      );
      socketService.emitContentGenerationStarted(message.userId, message.payload);
    },
    onCompleted: (message) => {
      logger.info(
        `Received generation completed event for user ${message.userId}, content: ${message.payload.contentId}`
      );
      socketService.emitContentGenerationCompleted(message.userId, message.payload);
    },
    onFailed: (message) => {
      logger.info(
        `Received generation failed event for user ${message.userId}, content: ${message.payload.contentId}`
      );
      socketService.emitContentGenerationFailed(message.userId, message.payload);
    },
  });
}

// Graceful shutdown handler
export function setupGracefulShutdown(httpServer: any) {
  const gracefulShutdown = async (signal: string) => {
    logger.info(`\n${signal} received. Starting graceful shutdown...`);

    try {
      // Close HTTP server
      httpServer.close(() => {
        logger.info('HTTP server closed');
      });

      // Shutdown Pub/Sub service
      await pubSubService.shutdown();

      logger.info('Server terminated gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  };

  // Handle termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
