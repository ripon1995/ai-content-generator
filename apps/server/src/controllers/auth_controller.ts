import { Request, Response } from 'express';
import { authService } from '../services/auth_service';
import { sendSuccess, sendError } from '../utils/response';
import { IUserResponse } from '../types/user_interfaces';
import logger from '../utils/logger';
import { HTTP_STATUS_CODES } from '../utils/messages';


export class AuthController {
  // register new user
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, firstName, lastName } = req.body;

      // register user through service
      const user = await authService.register({
        email,
        password,
        firstName,
        lastName,
      });

      // transform user to response format
      const userResponse: IUserResponse = {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${firstName} ${lastName}`,
      };

      logger.info(`User registered successfully: ${email}`);

      return sendSuccess(
        res,
        userResponse,
        'User registered successfully',
        HTTP_STATUS_CODES.CREATED
      );
    } catch (error: any) {
      logger.error('Registration error:', error);

      // handle specific errors
      if (error.message === 'Email already registered') {
        return sendError(
          res,
          'Email already registered',
          HTTP_STATUS_CODES.CONFLICT
        );
      }

      // handle MongoDB duplicate key error
      if (error.code === 11000) {
        return sendError(
          res,
          'Email already registered',
          HTTP_STATUS_CODES.CONFLICT
        );
      }

      // handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(
          (err: any) => err.message
        );
        return sendError(
          res,
          'Validation failed',
          HTTP_STATUS_CODES.BAD_REQUEST,
          messages.map((msg) => ({ message: msg }))
        );
      }

      return sendError(
        res,
        'Failed to register user',
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }
}

// Export singleton instance
export const authController = new AuthController();
