import { User, RefreshToken } from '../models';
import { IUserDocument, IUserInput } from '../types/user_interfaces';
import { ConflictException, UnauthorizedException } from '../exceptions';
import logger from '../utils/logger';
import { generateTokens, verifyToken, generateAccessToken } from '../utils/jwt';
import { env } from '../config/env';

// auth service file to handle business logics

export class AuthService {
  // register a new user
  async register(
    userData: IUserInput,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<{ user: IUserDocument; accessToken: string; refreshToken: string }> {
    const { email, password, firstName, lastName } = userData;

    // check if user already exists
    const existingUser = await this.emailExists(email);

    if (existingUser) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      throw new ConflictException('Email already registered');
    }

    // create new user (password will be hashed automatically by pre-save hook)
    const newUser = await User.create({
      email,
      password,
      firstName,
      lastName,
    });

    // generate JWT tokens (access and refresh)
    const { accessToken, refreshToken } = generateTokens({
      userId: newUser._id.toString(),
      email: newUser.email,
    });

    // store refresh token in database (will be hashed by pre-save hook)
    const expiresAt = new Date(Date.now() + env.jwtRefreshTokenExpiresIn * 1000);
    await RefreshToken.create({
      userId: newUser._id.toString(),
      token: refreshToken,
      expiresAt,
      deviceInfo,
      ipAddress,
      lastUsedAt: new Date(),
    });

    logger.info(`New user registered successfully: ${email}`);

    return { user: newUser, accessToken, refreshToken };
  }

  // login user
  async login(
    email: string,
    password: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<{ user: IUserDocument; accessToken: string; refreshToken: string }> {
    // find user by email (include password field)
    const user = await this.getUserByEmail(email);

    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      logger.warn(`Login attempt with invalid password for email: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // generate JWT tokens (access and refresh)
    const { accessToken, refreshToken } = generateTokens({
      userId: user._id.toString(),
      email: user.email,
    });

    // store refresh token in database (will be hashed by pre-save hook)
    const expiresAt = new Date(Date.now() + env.jwtRefreshTokenExpiresIn * 1000);
    await RefreshToken.create({
      userId: user._id.toString(),
      token: refreshToken,
      expiresAt,
      deviceInfo,
      ipAddress,
      lastUsedAt: new Date(),
    });

    logger.info(`User logged in successfully: ${email}`);

    return { user, accessToken, refreshToken };
  }


  // check email exists or not
  private async emailExists(email: string): Promise<boolean> {
    const user = await User.findOne({ email });
    return !!user;
  }

  // find user by email
  private async getUserByEmail(email: string): Promise<IUserDocument | null> {
    return await User.findOne({ email }).select('+password');
  }

  // find user by id
  private async getUserById(userId: string): Promise<IUserDocument | null> {
    return await User.findOne({ _id: userId });
  }

  // refresh access token using refresh token
  async refreshAccessToken(
    refreshTokenString: string
  ): Promise<{ accessToken: string; user: IUserDocument }> {
    // verify refresh token JWT signature
    const decoded = verifyToken(refreshTokenString);

    // find user
    const user = await this.getUserById(decoded.userId);
    if (!user) {
      logger.warn(`Refresh token attempt with non-existent user ID: ${decoded.userId}`);
      throw new UnauthorizedException('Invalid refresh token');
    }

    // find refresh token in database
    const storedTokens = await RefreshToken.find({
      userId: decoded.userId,
      isRevoked: false,
    });

    if (!storedTokens || storedTokens.length === 0) {
      logger.warn(`No valid refresh tokens found for user: ${decoded.email}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // compare with stored tokens (since they're hashed)
    let validToken = null;
    for (const storedToken of storedTokens) {
      const isMatch = await storedToken.compareToken(refreshTokenString);
      if (isMatch) {
        validToken = storedToken;
        break;
      }
    }

    if (!validToken) {
      logger.warn(`Refresh token not found in database for user: ${decoded.email}`);
      throw new UnauthorizedException('Invalid refresh token');
    }

    // check if token is expired
    if (validToken.expiresAt < new Date()) {
      logger.warn(`Expired refresh token used by user: ${decoded.email}`);
      throw new UnauthorizedException('Refresh token has expired. Please login again');
    }

    // generate new access token
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // update last used timestamp
    validToken.lastUsedAt = new Date();
    await validToken.save();

    logger.info(`Access token refreshed for user: ${decoded.email}`);

    return { accessToken, user };
  }
}

// Export singleton instance
export const authService = new AuthService();
