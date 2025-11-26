import { Request, Response } from 'express';
import { authService } from '../services/auth_service';
import { sendSuccess } from '../utils/response';
import { IUserResponse, IAuthResponse, IRefreshResponse, IUserDocument } from '../types/user_interfaces';
import { IRefreshTokenInput } from '../types/refresh_token_interfaces';
import logger from '../utils/logger';
import { HTTP_STATUS_CODES } from '../utils/messages';

export class AuthController {
  // private helper method to transform user document to response format
  private transformUserToResponse(user: IUserDocument): IUserResponse {
    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
    };
  }
  // register new user
  async register(req: Request, res: Response): Promise<Response> {
    const { email, password, firstName, lastName } = req.body;

    // extract device info and IP address
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';

    // register user through service (errors will be caught by global error handler)
    const { user, accessToken, refreshToken } = await authService.register(
      {
        email,
        password,
        firstName,
        lastName,
      },
      deviceInfo,
      ipAddress
    );

    const authResponse: IAuthResponse = {
      user: this.transformUserToResponse(user),
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

    // extract device info and IP address
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';

    // login user through service (errors will be caught by global error handler)
    const { user, accessToken, refreshToken } = await authService.login(
      email,
      password,
      deviceInfo,
      ipAddress
    );

    const authResponse: IAuthResponse = {
      user: this.transformUserToResponse(user),
      access_token: accessToken,
      refresh_token: refreshToken,
    };

    logger.info(`User logged in successfully: ${email}`);

    return sendSuccess(res, authResponse, 'Login successful', HTTP_STATUS_CODES.OK);
  }

  // refresh access token
  async refreshToken(req: Request<{}, {}, IRefreshTokenInput>, res: Response): Promise<Response> {
    const { refresh_token } = req.body;

    // refresh access token through service
    const { accessToken, user } = await authService.refreshAccessToken(refresh_token);

    logger.info(`Access token refreshed for user: ${user.email}`);

    const refreshResponse: IRefreshResponse = {
      user: this.transformUserToResponse(user),
      access_token: accessToken,
    };

    return sendSuccess(res, refreshResponse, 'Access token refreshed successfully', HTTP_STATUS_CODES.OK);
  }
}

// Export singleton instance
export const authController = new AuthController();
