import dotenv from 'dotenv';
import path from 'path';
import { ENV_MESSAGES } from '../utils/messages';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

interface EnvConfig {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  frontendUrl: string;
  jwtSecret: string;
  jwtAccessTokenExpiresIn: number;
  jwtRefreshTokenExpiresIn: number;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(ENV_MESSAGES.MISSING_ENV_VARIABLES(key));
  }
  return value;
};

export const env: EnvConfig = {
  port: parseInt(getEnvVar('PORT', '5000'), 10),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  mongodbUri: getEnvVar('MONGODB_URI'),
  frontendUrl: getEnvVar('FRONTEND_URL', 'http://localhost:5173'),
  jwtSecret: getEnvVar('JWT_SECRET'),
  jwtAccessTokenExpiresIn: parseInt(getEnvVar('JWT_ACCESS_TOKEN_EXPIRES_IN', '900'), 10),
  jwtRefreshTokenExpiresIn: parseInt(getEnvVar('JWT_REFRESH_TOKEN_EXPIRES_IN', '604800'), 10),
};