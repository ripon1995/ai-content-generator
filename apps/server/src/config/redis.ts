import Redis from 'ioredis';
import { env } from './env';
import logger from '../utils/logger';

// redis connection configuration
const redisConfig = {
  host: env.redisHost,
  port: env.redisPort,
  password: env.redisPassword,
  maxRetriesPerRequest: null, // required for Bull
  enableReadyCheck: false,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// create redis client instance
export const redisClient = new Redis(redisConfig);

// redis connection events
redisClient.on('connect', () => {
  logger.info('Redis client connecting...');
});

redisClient.on('ready', () => {
  logger.info('Redis client connected successfully');
});

redisClient.on('error', (error: Error) => {
  logger.error('Redis client error:', error);
});

redisClient.on('close', () => {
  logger.warn('Redis client connection closed');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis client reconnecting...');
});

// graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing Redis connection...');
  await redisClient.quit();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing Redis connection...');
  await redisClient.quit();
});
