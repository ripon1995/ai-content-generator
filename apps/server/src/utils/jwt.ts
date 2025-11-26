import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JWTTOkenGenerationException, UnauthorizedException } from '../exceptions';
import logger from './logger';

// JWT payload interface
export interface IJwtPayload {
  userId: string;
  email: string;
}

// JWT decoded payload interface
export interface IDecodedToken extends IJwtPayload {
  iat: number;
  exp: number;
}

// generate access token
export const generateAccessToken = (payload: IJwtPayload): string => {
  try {
    const token = jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtAccessTokenExpiresIn,
    });

    logger.info(`JWT access token generated for user: ${payload.email}`);
    return token;
  } catch (error) {
    logger.error('Error generating JWT access token:', error);
    throw new JWTTOkenGenerationException('Failed to generate access token');
  }
};

// generate refresh token
const generateRefreshToken = (payload: IJwtPayload): string => {
  try {
    const token = jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtRefreshTokenExpiresIn,
    });

    logger.info(`JWT refresh token generated for user: ${payload.email}`);
    return token;
  } catch (error) {
    logger.error('Error generating JWT refresh token:', error);
    throw new JWTTOkenGenerationException('Failed to generate refresh token');
  }
};

// generate token pair
export const generateTokens = (
  payload: IJwtPayload
): { accessToken: string; refreshToken: string } => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
};

// verify token
export const verifyToken = (token: string): IDecodedToken => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as IDecodedToken;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('JWT token expired');
      throw new UnauthorizedException('Token has expired. Please login again');
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token');
      throw new UnauthorizedException('Invalid token. Please login again');
    }

    logger.error('Error verifying JWT token:', error);
    throw new UnauthorizedException('Authentication failed');
  }
};
