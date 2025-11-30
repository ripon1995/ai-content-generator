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
  redisUrl: string;
  redisHost: string;
  redisPort: number;
  redisPassword?: string;
  geminiApiKey: string;
  geminiModel: string;
  geminiTemperature: number;
  geminiMaxTokens: number;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(ENV_MESSAGES.MISSING_ENV_VARIABLES(key));
  }
  return value;
};

// parse Redis URL if provided (Render-style: redis://host:port)
const parseRedisUrl = (redisUrl?: string) => {
  if (!redisUrl) {
    return {
      host: getEnvVar('REDIS_HOST', 'localhost'),
      port: parseInt(getEnvVar('REDIS_PORT', '6379'), 10),
      password: process.env.REDIS_PASSWORD,
    };
  }

  try {
    // parse URL like: redis://red-abc123:6379 or redis://:password@red-abc123:6379
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      password: url.password || process.env.REDIS_PASSWORD,
    };
  } catch (error) {
    // If parsing fails, fall back to individual env vars
    console.warn('Failed to parse REDIS_URL, using individual env vars:', error);
    return {
      host: getEnvVar('REDIS_HOST', 'localhost'),
      port: parseInt(getEnvVar('REDIS_PORT', '6379'), 10),
      password: process.env.REDIS_PASSWORD,
    };
  }
};

// parse Redis connection details from REDIS_URL or individual vars
const redisConfig = parseRedisUrl(process.env.REDIS_URL);

export const env: EnvConfig = {
  port: parseInt(getEnvVar('PORT', '5000'), 10),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  mongodbUri: getEnvVar('MONGODB_URI'),
  frontendUrl: getEnvVar('FRONTEND_URL', 'http://localhost:5173'),
  jwtSecret: getEnvVar('JWT_SECRET'),
  jwtAccessTokenExpiresIn: parseInt(getEnvVar('JWT_ACCESS_TOKEN_EXPIRES_IN', '900'), 10),
  jwtRefreshTokenExpiresIn: parseInt(getEnvVar('JWT_REFRESH_TOKEN_EXPIRES_IN', '604800'), 10),
  redisUrl: process.env.REDIS_URL || `redis://${redisConfig.host}:${redisConfig.port}`,
  redisHost: redisConfig.host,
  redisPort: redisConfig.port,
  redisPassword: redisConfig.password,
  geminiApiKey: getEnvVar('GEMINI_API_KEY'),
  geminiModel: getEnvVar('GEMINI_MODEL', 'gemini-1.5-flash'),
  geminiTemperature: parseFloat(getEnvVar('GEMINI_TEMPERATURE', '0.7')),
  geminiMaxTokens: parseInt(getEnvVar('GEMINI_MAX_TOKENS', '1024'), 10),
};
