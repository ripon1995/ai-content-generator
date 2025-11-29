import mongoose from 'mongoose';
import { env } from './env';
import logger from '../utils/logger';
import { MONGO_DB_MESSAGES } from '../utils/messages';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongodbUri);
    logger.info(MONGO_DB_MESSAGES.MONGO_CONNECTION_SUCCESS);
  } catch (error) {
    logger.error(MONGO_DB_MESSAGES.CONNECTION_FAILED(error));
    process.exit(1);
  }
};

// Mongoose events
mongoose.connection.on('disconnected', () => {
  logger.warn(MONGO_DB_MESSAGES.MONGO_DISCONNECTED);
});

mongoose.connection.on('error', (error) => {
  logger.error(MONGO_DB_MESSAGES.MONGO_DB_ERROR(error));
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info(MONGO_DB_MESSAGES.MONGO_DB_CONNECTION_CLOSE);
  process.exit(0);
});
