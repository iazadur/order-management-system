import { Router } from 'express';
import { AnalyticsController } from './controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();
const controller = new AnalyticsController();

// All analytics routes require authentication
router.use(authenticate);

// GET /api/analytics/dashboard - Get dashboard statistics
router.get('/dashboard', controller.getDashboardStats);

export default router;

