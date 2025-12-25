import { Router } from 'express';
import { PromotionController } from './controller';
import { authenticate } from '../../middlewares/auth';
import { validateBody, validateParams } from '../../middlewares/validation';
import {
  createPromotionSchema,
  updatePromotionSchema,
  togglePromotionSchema,
} from './dto';
import { z } from 'zod';

const router = Router();
const controller = new PromotionController();

// Public route - no authentication required
// GET /api/promotions/active - Get active promotions
router.get('/active', controller.getActive);

// Protected routes - authentication required
router.use(authenticate);

// GET /api/promotions - Get all promotions
router.get('/', controller.getAll);

// GET /api/promotions/:id - Get promotion by ID
router.get(
  '/:id',
  validateParams(z.object({ id: z.string().uuid() })),
  controller.getById
);

// POST /api/promotions - Create promotion
router.post(
  '/',
  validateBody(createPromotionSchema),
  controller.create
);

// PUT /api/promotions/:id - Update promotion (limited fields)
router.put(
  '/:id',
  validateParams(z.object({ id: z.string().uuid() })),
  validateBody(updatePromotionSchema),
  controller.update
);

// PATCH /api/promotions/:id/toggle - Toggle promotion enabled/disabled
router.patch(
  '/:id/toggle',
  validateParams(z.object({ id: z.string().uuid() })),
  validateBody(togglePromotionSchema),
  controller.toggle
);

export default router;
