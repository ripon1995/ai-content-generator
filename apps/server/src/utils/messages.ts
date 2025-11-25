
// messages for mongo db connection and errors
export const MONGO_DB_MESSAGES = {
    MONGO_CONNECTION_SUCCESS : 'MongoDB connected successfully',
    CONNECTION_FAILED: (error: any): string => `MongoDB connection failed. Error details: ${error.message || String(error)}`,
    MONGO_DISCONNECTED: 'MongoDB disconnected',
    MONGO_DB_ERROR: (error: any): string => `MongoDB error. Error details: ${error.message || String(error)}`,
    MONGO_DB_CONNECTION_CLOSE: 'MongoDB connection closed through app termination'
}

export const ENV_MESSAGES = {
    MISSING_ENV_VARIABLES: (key: string): string => `Missing required environment variable: ${key}`,
}