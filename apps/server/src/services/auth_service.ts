import { User } from '../models';
import { IUserDocument, IUserInput } from '../types/user_interfaces';
import { ConflictException, UnauthorizedException } from '../exceptions';
import logger from '../utils/logger';
import { generateTokens } from '../utils/jwt';

// auth service file to handle business logics

export class AuthService {
  // register a new user
  async register(
    userData: IUserInput
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

    logger.info(`New user registered successfully: ${email}`);

    return { user: newUser, accessToken, refreshToken };
  }

  // login user
  async login(
    email: string,
    password: string
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
  async getUserById(userId: string): Promise<IUserDocument | null> {
    return await User.findOne({ _id: userId });
  }
}

// Export singleton instance
export const authService = new AuthService();
