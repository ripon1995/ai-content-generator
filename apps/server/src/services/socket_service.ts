import { Server as SocketIOServer } from 'socket.io';
import {
  SocketEvents,
  IContentGenerationStartedPayload,
  IContentGenerationCompletedPayload,
  IContentGenerationFailedPayload,
} from '../types/socket_interfaces';
import { AuthenticatedSocket, socketAuthMiddleware } from '../middleware/socket_auth';
import logger from '../utils/logger';

// socket service to manage socket.io connections and events
class SocketService {
  private socketIO: SocketIOServer | null = null;
  private connectedUsers: Map<string, Set<string>> = new Map();

  // initialize socket.io server
  initialize(socketIo: SocketIOServer): void {
    this.socketIO = socketIo;

    // apply authentication middleware
    this.socketIO.use(socketAuthMiddleware);

    // handle connections
    this.socketIO.on(SocketEvents.CONNECTION, (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });

    logger.info('Socket.IO service initialized');
  }

  // handle new socket connection
  private handleConnection(socket: AuthenticatedSocket): void {
    const userId = socket.user?.userId;

    if (!userId) {
      logger.warn('Socket connected without userId');
      socket.disconnect();
      return;
    }

    logger.info(`User connected via socket: ${userId}, Socket ID: ${socket.id}`);

    // add user to their personal room
    socket.join(`user:${userId}`);

    // track connected socket
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)?.add(socket.id);

    logger.info(`User ${userId} joined room: user:${userId}`);

    // handle disconnect
    socket.on(SocketEvents.DISCONNECT, () => {
      this.handleDisconnect(socket, userId);
    });

    // handle errors
    socket.on(SocketEvents.ERROR, (error: Error) => {
      logger.error(`Socket error for user ${userId}:`, error);
    });
  }

  // handle socket disconnect
  private handleDisconnect(socket: AuthenticatedSocket, userId: string): void {
    logger.info(`User disconnected: ${userId}, Socket ID: ${socket.id}`);

    // remove socket from tracking
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        this.connectedUsers.delete(userId);
        logger.info(`User ${userId} has no active connections`);
      }
    }
  }

  // emit content generation started event to user
  emitContentGenerationStarted(userId: string, payload: IContentGenerationStartedPayload): void {
    if (!this.socketIO) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    this.socketIO.to(`user:${userId}`).emit(SocketEvents.CONTENT_GENERATION_STARTED, payload);

    logger.info(`Emitted generation started to user ${userId}, content: ${payload.contentId}`);
  }

  // emit content generation completed event to user
  emitContentGenerationCompleted(
    userId: string,
    payload: IContentGenerationCompletedPayload
  ): void {
    if (!this.socketIO) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    this.socketIO.to(`user:${userId}`).emit(SocketEvents.CONTENT_GENERATION_COMPLETED, payload);

    logger.info(`Emitted generation completed to user ${userId}, content: ${payload.contentId}`);
  }

  // emit content generation failed event to user
  emitContentGenerationFailed(userId: string, payload: IContentGenerationFailedPayload): void {
    if (!this.socketIO) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    this.socketIO.to(`user:${userId}`).emit(SocketEvents.CONTENT_GENERATION_FAILED, payload);

    logger.info(
      `Emitted generation failed to user ${userId}, content: ${payload.contentId}, reason: ${payload.failureReason}`
    );
  }
}

// export singleton instance
export const socketService = new SocketService();
