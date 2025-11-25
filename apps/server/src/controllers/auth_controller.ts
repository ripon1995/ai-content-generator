import { Request, Response } from 'express';
import { authService } from '../services/auth_service';
import { sendSuccess } from '../utils/response';
import { IUserResponse } from '../types/user_interfaces';
import logger from '../utils/logger';
import { HTTP_STATUS_CODES } from '../utils/messages';

export class AuthController {
  // register new user
  async register(req: Request, res: Response): Promise<Response> {
    const { email, password, firstName, lastName } = req.body;

    // register user through service (errors will be caught by global error handler)
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
  }
}

// Export singleton instance
export const authController = new AuthController();
