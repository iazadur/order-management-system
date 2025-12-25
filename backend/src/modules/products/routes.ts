import { Router } from 'express';
import { ProductController } from './controller';
import { authenticate } from '../../middlewares/auth';
import { validateBody, validateQuery, validateParams } from '../../middlewares/validation';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  toggleProductSchema,
} from './dto';
import { z } from 'zod';

const router = Router();
const controller = new ProductController();

// Public routes - no authentication required
// GET /api/products - Get all products (query param: includeDisabled)
router.get(
  '/',
  validateQuery(productQuerySchema),
  controller.getAll
);

// GET /api/products/:id - Get product by ID
router.get(
  '/:id',
  validateParams(z.object({ id: z.string().uuid() })),
  controller.getById
);

// Protected routes - authentication required
// POST /api/products - Create product
router.post(
  '/',
  authenticate,
  validateBody(createProductSchema),
  controller.create
);

// PUT /api/products/:id - Update product
router.put(
  '/:id',
  authenticate,
  validateParams(z.object({ id: z.string().uuid() })),
  validateBody(updateProductSchema),
  controller.update
);

// PATCH /api/products/:id/toggle - Toggle product enabled/disabled
router.patch(
  '/:id/toggle',
  authenticate,
  validateParams(z.object({ id: z.string().uuid() })),
  validateBody(toggleProductSchema),
  controller.toggle
);

export default router;

