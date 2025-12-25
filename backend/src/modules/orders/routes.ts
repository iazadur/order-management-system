import { Router } from 'express';
import { OrderController } from './controller';
import { authenticate } from '../../middlewares/auth';
import { validateBody, validateParams } from '../../middlewares/validation';
import { createOrderSchema } from './dto';
import { z } from 'zod';

const router = Router();
const controller = new OrderController();

// All order routes require authentication
router.use(authenticate);

// POST /api/orders - Create order
router.post(
  '/',
  validateBody(createOrderSchema),
  controller.create
);

// GET /api/orders/my - Get user's orders
router.get('/my', controller.getMyOrders);

// GET /api/orders - Get all orders (admin only)
// TODO: Add admin check middleware
router.get('/', controller.getAll);

// GET /api/orders/stats - Get order statistics (admin only)
// TODO: Add admin check middleware
router.get('/stats', controller.getStats);

// GET /api/orders/:id - Get order by ID
router.get(
  '/:id',
  validateParams(z.object({ id: z.string().uuid() })),
  controller.getById
);

export default router;
