import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './env';
import logger from '../utils/logger';

const developmentUrls: string[] = ['http://localhost:5173', 'http://localhost:3000'];
const productionUrls: string[] = [];

// configuration for socket.io
export const createSocketServer = (httpServer: HTTPServer): SocketIOServer => {
  const socketIo = new SocketIOServer(httpServer, {
    cors: {
      origin: env.nodeEnv === 'development' ? developmentUrls : productionUrls,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000, // if the pong packet is not recieved within 60 seconds will be considered as connection closed
    pingInterval: 25000, // server sends ping request after every 25 seconds
  });

  logger.info('=========Socket.IO server configured successfully========');

  return socketIo;
};
