import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { verifyToken } from '../utils/jwt';
import { IAuthenticatedSocket } from '../types/socket_interfaces';
import logger from '../utils/logger';

// extend Socket interface to include authenticated user data
export interface AuthenticatedSocket extends Socket {
  user?: IAuthenticatedSocket;
}

// socket.io authentication middleware
export const socketAuthMiddleware = (
  socket: AuthenticatedSocket,
  next: (err?: ExtendedError) => void
): void => {
  try {
    // get token from handshake auth or query
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token || typeof token !== 'string') {
      logger.warn('Socket connection attempt without token');
      return next(new Error('Authentication error: No token provided'));
    }

    // verify token
    const decoded = verifyToken(token);

    // attach user data to socket
    socket.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    logger.info(`Socket authenticated for user: ${decoded.userId}`);
    next();
  } catch (error: any) {
    logger.error('Socket authentication failed:', error.message);
    // passing the error to next just to execute the rejection or notify gracefully even after the error occurs
    return next(new Error('Authentication error: Invalid token'));
  }
};
