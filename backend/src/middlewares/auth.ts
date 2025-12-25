import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/auth';
import { AuthenticatedRequest } from '../types';
import { UnauthorizedError } from '../utils/errors';
import { sendError } from '../utils/response';
import logger from '../config/logger';

/**
 * Middleware to authenticate requests using JWT access token
 * Attaches user information to request object
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Try to get token from cookie first (preferred)
    let token = req.cookies?.accessToken;

    // Fallback to Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return sendError(res, new UnauthorizedError('Authentication required'), 401);
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      return sendError(res, new UnauthorizedError('Invalid or expired token'), 401);
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    logger.error('Authentication middleware error', { error });
    return sendError(res, new Error('Internal server error'), 500);
  }
}

