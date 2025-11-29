import express from 'express';
import { connectDatabase } from './config/database';
import { contentGenerationQueue } from './config/queue';
import { processContentGeneration } from './jobs/content_generation_processor';
import logger from './utils/logger';
import { env } from './config/env';

// register job processor with queue
async function startWorker() {
  try {
    // connect to database first
    await connectDatabase();

    logger.info('Worker process starting...');
    logger.info(`Environment: ${env.nodeEnv}`);

    // dummy check to fix the build issue
    const app = express();
    const PORT = process.env.PORT || 10000;
    app.get('/', (_req, res) => {
      res.status(200).send('Worker is active and processing jobs');
    });

    // Start listening on the port
    app.listen(PORT, () => {
      logger.info(`Worker health check server listening on port ${PORT}`);
    });

    //register the content generation processor
    contentGenerationQueue.process(async (job) => {
      return await processContentGeneration(job);
    });

    logger.info('Content generation processor registered');
    logger.info('Worker is now listening for jobs...');

    //setup event handlers for job lifecycle
    setupEventHandlers();

    // setup graceful shutdown
    setupGracefulShutdown();
  } catch (error) {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  }
}

function setupEventHandlers() {
  // job completed successfully
  contentGenerationQueue.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully`);
  });

  // job failed
  contentGenerationQueue.on('failed', (job, error) => {
    if (job) {
      logger.error(`Job ${job.id} failed after ${job.attemptsMade} attempts:`, error.message);
    } else {
      logger.error('Job failed:', error.message);
    }
  });

  // job is active (processing)
  contentGenerationQueue.on('active', (job) => {
    logger.info(`Job ${job.id} is now being processed...`);
  });

  // job is waiting (delayed or queued)
  contentGenerationQueue.on('waiting', (jobId) => {
    logger.info(`Job ${jobId} is waiting in the queue...`);
  });

  // job progress (if we implement progress tracking later)
  contentGenerationQueue.on('progress', (job, progress) => {
    logger.info(`Job ${job.id} progress: ${progress}%`);
  });

  // queue error
  contentGenerationQueue.on('error', (error) => {
    logger.error('Queue error:', error);
  });

  // queue stalled (job took too long)
  contentGenerationQueue.on('stalled', (job) => {
    logger.warn(`Job ${job.id} has stalled`);
  });
}

function setupGracefulShutdown() {
  const gracefulShutdown = async (signal: string) => {
    logger.info(`\n${signal} received. Starting graceful shutdown...`);

    try {
      // close the queue gracefully
      await contentGenerationQueue.close();
      logger.info('Queue closed successfully');

      // exit process
      logger.info('Worker process terminated gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  };

  // handle different termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });

  // handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });
}

// start the worker
startWorker();
