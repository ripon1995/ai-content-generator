import { Request, Response } from 'express';
import { authService } from '../services/auth_service';
import { sendSuccess } from '../utils/response';
import { IUserResponse, IAuthResponse } from '../types/user_interfaces';
import logger from '../utils/logger';
import { HTTP_STATUS_CODES } from '../utils/messages';

export class AuthController {
  // register new user
  async register(req: Request, res: Response): Promise<Response> {
    const { email, password, firstName, lastName } = req.body;

    // register user through service (errors will be caught by global error handler)
    const { user, accessToken, refreshToken } = await authService.register({
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

    const authResponse: IAuthResponse = {
      user: userResponse,
      access_token: accessToken,
      refresh_token: refreshToken,
    };

    logger.info(`User registered successfully: ${email}`);

    return sendSuccess(
      res,
      authResponse,
      'User registered successfully',
      HTTP_STATUS_CODES.CREATED
    );
  }

  // login user
  async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    // login user through service (errors will be caught by global error handler)
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    // transform user to response format
    const userResponse: IUserResponse = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
    };

    const authResponse: IAuthResponse = {
      user: userResponse,
      access_token: accessToken,
      refresh_token: refreshToken,
    };

    logger.info(`User logged in successfully: ${email}`);

    return sendSuccess(res, authResponse, 'Login successful', HTTP_STATUS_CODES.OK);
  }
}

// Export singleton instance
export const authController = new AuthController();
