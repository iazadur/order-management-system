import { Router } from 'express';
import { AuthController } from './controller';
import { authenticate } from '../../middlewares/auth';
import { authLimiter } from '../../middlewares/rateLimit';

const router = Router();
const controller = new AuthController();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  authLimiter,
  controller.register
);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post(
  '/login',
  authLimiter,
  controller.login
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  controller.refresh
);

/**
 * POST /api/auth/logout
 * Logout and revoke refresh token
 */
router.post(
  '/logout',
  authenticate,
  controller.logout
);

/**
 * POST /api/auth/logout-all
 * Logout from all devices (revoke all refresh tokens)
 */
router.post(
  '/logout-all',
  authenticate,
  controller.logoutAll
);

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get(
  '/me',
  authenticate,
  controller.getMe
);

export default router;

