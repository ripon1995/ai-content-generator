import { Request, Response, NextFunction } from 'express';
import { BaseException } from '../exceptions';
import { sendError } from '../utils/response';
import logger from '../utils/logger';
import { HTTP_STATUS_CODES } from '../utils/messages';

// global error handler middleware
// it should be placed afer all routes
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  // Log the error
  logger.error('Error caught by error handler:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });

  // Handle custom exceptions
  if (error instanceof BaseException) {
    return sendError(
      res,
      error.message,
      error.statusCode,
      error.errors
    );
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values((error as any).errors).map((err: any) => ({
      field: err.path,
      message: err.message,
    }));

    return sendError(
      res,
      'Validation failed',
      HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
      errors
    );
  }

  // Handle Mongoose duplicate key error (11000)
  if ((error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    return sendError(
      res,
      `${field} already exists`,
      HTTP_STATUS_CODES.CONFLICT
    );
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (error.name === 'CastError') {
    return sendError(
      res,
      'Invalid ID format',
      HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return sendError(
      res,
      'Invalid token',
      HTTP_STATUS_CODES.UNAUTHORIZED
    );
  }

  if (error.name === 'TokenExpiredError') {
    return sendError(
      res,
      'Token expired',
      HTTP_STATUS_CODES.UNAUTHORIZED
    );
  }

  // Handle unknown/unexpected errors
  logger.error('Unexpected error:', error);

  return sendError(
    res,
    'An unexpected error occurred',
    HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
  );
};


// wrapper class to reduce the try...catch boilerplate
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
