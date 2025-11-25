import { User } from '../models';
import { IUserDocument, IUserInput } from '../types/user_interfaces';
import { ConflictException } from '../exceptions';
import logger from '../utils/logger';

// auth service file to handle business logics

export class AuthService {
  // register a new user
  async register(userData: IUserInput): Promise<IUserDocument> {
    const { email, password, firstName, lastName } = userData;

    // check if user already exists (middleware auto-filters isDeleted: false)
    const existingUser = await User.findOne({ email });

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

    logger.info(`New user registered successfully: ${email}`);

    return newUser;
  }


  // check email exists or not
  async emailExists(email: string): Promise<boolean> {
    const user = await User.findOne({ email });
    return !!user;
  }

  // find user by email
  async getUserByEmail(email: string): Promise<IUserDocument | null> {
    return await User.findOne({ email }).select('+password');
  }

  // find user by id
  async getUserById(userId: string): Promise<IUserDocument | null> {
    return await User.findOne({ _id: userId });
  }
}

// Export singleton instance
export const authService = new AuthService();
