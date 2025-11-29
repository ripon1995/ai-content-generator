import Queue, { QueueOptions } from 'bull';
import { env } from './env';
import logger from '../utils/logger';

// todo : can be improved the event listener based on the use case
// queue configuration options
const queueOptions: QueueOptions = {
  redis: env.redisUrl,
  defaultJobOptions: {
    delay: 60000, // 1 minute delay : same for all the jobs so placing here
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: false, // completed : clean the item from the queue
    removeOnFail: false, // failed : let's keep the job for debugging
  },
};
const queue_name: string = 'content-generation';
// create content generation queue
export const contentGenerationQueue = new Queue(queue_name, queueOptions);

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
