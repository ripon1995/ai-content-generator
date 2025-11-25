import {TResponseDefaultMessages, THttpStatusCodes} from '../types/messages_types';

// constant : messages for mongo db connection and errors
export const MONGO_DB_MESSAGES = {
    MONGO_CONNECTION_SUCCESS : 'MongoDB connected successfully',
    CONNECTION_FAILED: (error: any): string => `MongoDB connection failed. Error details: ${error.message || String(error)}`,
    MONGO_DISCONNECTED: 'MongoDB disconnected',
    MONGO_DB_ERROR: (error: any): string => `MongoDB error. Error details: ${error.message || String(error)}`,
    MONGO_DB_CONNECTION_CLOSE: 'MongoDB connection closed through app termination'
};

export const ENV_MESSAGES = {
    MISSING_ENV_VARIABLES: (key: string): string => `Missing required environment variable: ${key}`,
};

// constant : default response messages
export const RESPONSE_DEFAULT_MESSAGES : TResponseDefaultMessages = {
    SUCCESS: 'Successful',
    INTERNAL_ERROR: 'An internal error occurred',
    RESOURCE_NOT_FOUND: 'Resource not found',
    VALIDATION_FAILED: 'Validation failed',
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
    CREATION_SUCCESSFUL: 'Resource created successfully'
};

// constant : http status codes
export const HTTP_STATUS_CODES : THttpStatusCodes = {
  // status codes: successful
  OK: 200,
  CREATED: 201,

  // status codes: client side or validation
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,

  // status codes: server side
  INTERNAL_SERVER_ERROR: 500,
};