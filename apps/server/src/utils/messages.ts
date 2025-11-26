import {TMessages, THttpStatusCodes} from '../types/messages_types';

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
export const RESPONSE_DEFAULT_MESSAGES : TMessages = {
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
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // status codes: server side
  INTERNAL_SERVER_ERROR: 500,
};


export const COMMON_MEAAGES : TMessages = {
    EMAIL_REQUIRED: 'Email is required',
    VALID_EMAIL: 'Please provide a valid email address',
    PASSWORD_REQUIRED: 'Password is required',
    VALID_PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
    FIRST_NAME_REQUIRED: 'First name is required',
    LAST_NAME_REQIRED: 'Last name is required',
}

// constant : user schema messages
export const USER_SCHEMA_MESSAGES : TMessages = {
    ...COMMON_MEAAGES,
    // schema specific messages
    VALID_FIRST_NAME_MIN_LENGTH: 'First name must be at least 2 characters long',
    VALID_FIRST_NAME_MAX_LENGTH: 'First name cannot exceed 50 characters',
    VALID_LAST_NAME_MIN_LENGTH: 'Last name must be at least 2 characters long',
    VALID_LAST_NAME_MAX_LENGTH: 'Last name cannot exceed 50 characters'
}

// constant : user validation messages for registration api
export const REGISTRATION_VALIDATION_MESSAGES : TMessages = {
    ...COMMON_MEAAGES,
    // api specific messages
    PASSWORD_VALIDATION_RULE: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    FIRST_NAME_VALIDATION_LENGTH: 'First name must be between 2 and 50 characters',
    FIRST_NAME_VALIDATION_RULE: 'First name can only contain letters and spaces',
    LAST_NAME_VALIDATION_LENGTH: 'Last name must be between 2 and 50 characters',
    LAST_NAME_VALIDATION_RULE: 'Last name can only contain letters and spaces',
}

// constant : user validation messages for login api
export const LOGIN_VALIDATION_MESSAGES : TMessages = {
    ...COMMON_MEAAGES,
}

// constant : content validation messages
export const CONTENT_VALIDATION_MESSAGES : TMessages = {
    TITLE_REQUIRED: 'Title is required',
    TITLE_MAX_LENGTH: 'Title cannot exceed 200 characters',
    CONTENT_TYPE_REQUIRED: 'Content type is required',
    CONTENT_TYPE_INVALID: 'Content type must be one of: blog, product, social',
    PROMPT_REQUIRED: 'Prompt is required',
    PROMPT_MAX_LENGTH: 'Prompt cannot exceed 1000 characters',
    GENERATED_TEXT_REQUIRED: 'Generated text is required',
    STATUS_INVALID: 'Status must be either draft or published',
}