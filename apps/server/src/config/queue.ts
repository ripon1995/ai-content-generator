import Queue from 'bull';
import { env } from './env';
import logger from '../utils/logger';

// queue configuration options
const queueOptions = {
  redis: env.redisUrl,
  defaultJobOptions: {
    attempts: 3, // retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',
      delay: 2000, // start with 2 seconds delay
    },
    removeOnComplete: false, // keep completed jobs for history
    removeOnFail: false, // keep failed jobs for debugging
  },
};

// create content generation queue
export const contentGenerationQueue = new Queue('content-generation', queueOptions);

// queue event listeners
contentGenerationQueue.on('error', (error: Error) => {
  logger.error('Queue error:', error);
});

contentGenerationQueue.on('waiting', (jobId: number) => {
  logger.debug(`Job ${jobId} is waiting`);
});

contentGenerationQueue.on('active', (job) => {
  logger.info(`Job ${job.id} is now active - processing content generation`);
});

contentGenerationQueue.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

contentGenerationQueue.on('failed', (job, error: Error) => {
  logger.error(`Job ${job?.id} failed:`, error.message);
});

contentGenerationQueue.on('stalled', (job) => {
  logger.warn(`Job ${job.id} has stalled`);
});

// graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Closing queue connections...');
  await contentGenerationQueue.close();
  logger.info('Queue connections closed');
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// export queue instance
export default contentGenerationQueue;
