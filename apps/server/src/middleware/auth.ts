import { Request, Response, NextFunction } from 'express';
import { verifyToken, IDecodedToken } from '../utils/jwt';
import { UnauthorizedException } from '../exceptions';
import logger from '../utils/logger';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: IDecodedToken;
    }
  }
}

// authentication middleware 
export const authenticate = (req: Request, _: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided. Please login to continue');
    }

    // Check if token follows Bearer scheme
    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid token format. Use Bearer scheme');
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    if (!token) {
      throw new UnauthorizedException('No token provided. Please login to continue');
    }

    // Verify token and get decoded payload
    const decoded = verifyToken(token);

    // Attach user info to request object
    req.user = decoded;

    logger.debug(`User authenticated: ${decoded.email}`);

    next();
  } catch (error) {
    
    if (error instanceof UnauthorizedException) {
      next(error);
    } else {
      logger.error('Authentication error:', error);
      next(new UnauthorizedException('Authentication failed'));
    }
  }
};
