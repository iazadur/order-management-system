import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from './service';
import { registerSchema, loginSchema } from './dto';
import { setAuthCookies, clearAuthCookies } from '../../utils/cookie.util';
import { extractRequestMetadata, extractRefreshToken } from '../../utils/request.util';
import { sendSuccess, sendCreated } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  /**
   * POST /api/auth/register
   * Register a new user
   */
  register = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = registerSchema.parse(req.body);
      const metadata = extractRequestMetadata(req);

      const result = await this.service.register(data, metadata);

      // Set cookies
      setAuthCookies(res, result.accessToken, result.refreshToken);

      sendCreated(res, result, 'User registered successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }

      if (error instanceof Error) {
        if (error.message === 'User with this email already exists') {
          res.status(409).json({
            success: false,
            error: error.message,
          });
          return;
        }
      }

      next(error);
    }
  };

  /**
   * POST /api/auth/login
   * Login user
   */
  login = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = loginSchema.parse(req.body);
      const metadata = extractRequestMetadata(req);

      const result = await this.service.login(data, metadata);

      // Set cookies
      setAuthCookies(res, result.accessToken, result.refreshToken);

      sendSuccess(res, result, 'Logged in successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }

      if (error instanceof Error) {
        if (error.message === 'Invalid email or password') {
          res.status(401).json({
            success: false,
            error: error.message,
          });
          return;
        }
      }

      next(error);
    }
  };

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  refresh = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = extractRefreshToken(req);

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: 'Refresh token required',
        });
        return;
      }

      const metadata = extractRequestMetadata(req);
      const result = await this.service.refresh(refreshToken, metadata);

      // Set cookies
      setAuthCookies(res, result.accessToken, result.refreshToken);

      sendSuccess(res, result, 'Tokens refreshed successfully');
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === 'Invalid or expired refresh token' ||
          error.message === 'User not found'
        ) {
          res.status(401).json({
            success: false,
            error: error.message,
          });
          return;
        }
      }

      next(error);
    }
  };

  /**
   * POST /api/auth/logout
   * Logout user
   */
  logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = extractRefreshToken(req);
      await this.service.logout(refreshToken);

      clearAuthCookies(res);

      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/logout-all
   * Logout from all devices
   */
  logoutAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      await this.service.logoutAll(req.user.userId);
      clearAuthCookies(res);

      sendSuccess(res, null, 'Logged out from all devices successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/auth/me
   * Get current user
   */
  getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const user = await this.service.getUserById(req.user.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      sendSuccess(res, { user }, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}

