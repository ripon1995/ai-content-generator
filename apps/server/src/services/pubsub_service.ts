import Redis from 'ioredis';
import { redisConfig } from '../config/redis';
import logger from '../utils/logger';
import {
  IContentGenerationStartedPayload,
  IContentGenerationCompletedPayload,
  IContentGenerationFailedPayload,
} from '../types/socket_interfaces';

// redis pub/sub channels
export const PubSubChannels = {
  CONTENT_GENERATION_STARTED: 'content:generation:started',
  CONTENT_GENERATION_COMPLETED: 'content:generation:completed',
  CONTENT_GENERATION_FAILED: 'content:generation:failed',
} as const;

// message payloads with userId
export interface IPubSubMessage<T> {
  userId: string;
  payload: T;
}

// redis pub/sub service for cross-process communication
class PubSubService {
  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;
  private isInitialized = false;

  // initialize redis pub/sub clients
  initialize(): void {
    if (this.isInitialized) {
      logger.warn('PubSubService already initialized');
      return;
    }

    try {
      // create separate redis clients for publisher and subscriber
      // reuse the same config as main Redis client for consistency
      const pubSubConfig = {
        ...redisConfig,
        maxRetriesPerRequest: 10, // allow retries for pub/sub
        enableReadyCheck: true,
      };

      // create publisher
      this.publisher = new Redis(pubSubConfig);
      this.publisher.on('connect', () => logger.info('Redis publisher connecting...'));
      this.publisher.on('ready', () => logger.info('Redis publisher ready'));
      this.publisher.on('error', (error) => {
        logger.error('Redis publisher error:', error);
        // Don't crash the app if Redis Pub/Sub fails
      });

      // create subscriber
      this.subscriber = new Redis(pubSubConfig);
      this.subscriber.on('connect', () => logger.info('Redis subscriber connecting...'));
      this.subscriber.on('ready', () => logger.info('Redis subscriber ready'));
      this.subscriber.on('error', (error) => {
        logger.error('Redis subscriber error:', error);
        // Don't crash the app if Redis Pub/Sub fails
      });

      this.isInitialized = true;
      logger.info('PubSubService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize PubSubService:', error);
      // Graceful degradation - app can still work without real-time updates
      this.isInitialized = false;
    }
  }

  // publish content generation started event
  async publishContentGenerationStarted(
    userId: string,
    payload: IContentGenerationStartedPayload
  ): Promise<void> {
    if (!this.publisher) {
      logger.error('Publisher not initialized');
      return;
    }

    const message: IPubSubMessage<IContentGenerationStartedPayload> = {
      userId,
      payload,
    };

    try {
      await this.publisher.publish(
        PubSubChannels.CONTENT_GENERATION_STARTED,
        JSON.stringify(message)
      );
      logger.info(
        `Published generation started event for user ${userId}, content: ${payload.contentId}`
      );
    } catch (error) {
      logger.error('Failed to publish generation started event:', error);
    }
  }

  // publish content generation completed event
  async publishContentGenerationCompleted(
    userId: string,
    payload: IContentGenerationCompletedPayload
  ): Promise<void> {
    if (!this.publisher) {
      logger.error('Publisher not initialized');
      return;
    }

    const message: IPubSubMessage<IContentGenerationCompletedPayload> = {
      userId,
      payload,
    };

    try {
      await this.publisher.publish(
        PubSubChannels.CONTENT_GENERATION_COMPLETED,
        JSON.stringify(message)
      );
      logger.info(
        `Published generation completed event for user ${userId}, content: ${payload.contentId}`
      );
    } catch (error) {
      logger.error('Failed to publish generation completed event:', error);
    }
  }

  // publish content generation failed event
  async publishContentGenerationFailed(
    userId: string,
    payload: IContentGenerationFailedPayload
  ): Promise<void> {
    if (!this.publisher) {
      logger.error('Publisher not initialized');
      return;
    }

    const message: IPubSubMessage<IContentGenerationFailedPayload> = {
      userId,
      payload,
    };

    try {
      await this.publisher.publish(
        PubSubChannels.CONTENT_GENERATION_FAILED,
        JSON.stringify(message)
      );
      logger.info(
        `Published generation failed event for user ${userId}, content: ${payload.contentId}`
      );
    } catch (error) {
      logger.error('Failed to publish generation failed event:', error);
    }
  }

  // subscribe to a channel with a callback
  private async subscribe(
    channel: string,
    callback: (message: IPubSubMessage<any>) => void
  ): Promise<void> {
    if (!this.subscriber) {
      logger.error('Subscriber not initialized');
      return;
    }

    try {
      await this.subscriber.subscribe(channel);
      logger.info(`Subscribed to channel: ${channel}`);

      // listen for messages
      this.subscriber.on('message', (receivedChannel, messageString) => {
        if (receivedChannel === channel) {
          try {
            const message = JSON.parse(messageString);
            callback(message);
          } catch (error) {
            logger.error(`Failed to parse message from channel ${channel}:`, error);
          }
        }
      });
    } catch (error) {
      logger.error(`Failed to subscribe to channel ${channel}:`, error);
    }
  }

  // subscribe to all content generation channels
  async subscribeToAllChannels(callbacks: {
    onStarted?: (message: IPubSubMessage<IContentGenerationStartedPayload>) => void;
    onCompleted?: (message: IPubSubMessage<IContentGenerationCompletedPayload>) => void;
    onFailed?: (message: IPubSubMessage<IContentGenerationFailedPayload>) => void;
  }): Promise<void> {
    if (callbacks.onStarted) {
      await this.subscribe(PubSubChannels.CONTENT_GENERATION_STARTED, callbacks.onStarted);
    }

    if (callbacks.onCompleted) {
      await this.subscribe(PubSubChannels.CONTENT_GENERATION_COMPLETED, callbacks.onCompleted);
    }

    if (callbacks.onFailed) {
      await this.subscribe(PubSubChannels.CONTENT_GENERATION_FAILED, callbacks.onFailed);
    }

    logger.info('Subscribed to all content generation channels');
  }

  // graceful shutdown
  async shutdown(): Promise<void> {
    logger.info('Shutting down PubSubService...');

    if (this.publisher) {
      await this.publisher.quit();
      logger.info('Publisher disconnected');
    }

    if (this.subscriber) {
      await this.subscriber.quit();
      logger.info('Subscriber disconnected');
    }

    this.isInitialized = false;
    logger.info('PubSubService shutdown complete');
  }
}

// export singleton instance
export const pubSubService = new PubSubService();
