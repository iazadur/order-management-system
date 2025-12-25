import { z } from 'zod';

/**
 * Promotion Type Enum
 */
export const promotionTypeSchema = z.enum(['PERCENTAGE', 'FIXED', 'WEIGHTED']);

/**
 * Create Slab DTO (for weighted promotions)
 */
export const createSlabSchema = z.object({
  minWeight: z
    .number()
    .int('Min weight must be an integer')
    .nonnegative('Min weight must be non-negative'),
  maxWeight: z
    .number()
    .int('Max weight must be an integer')
    .positive('Max weight must be positive'),
  discountPerUnit: z
    .number()
    .positive('Discount per unit must be positive'),
}).refine(
  (data) => data.minWeight < data.maxWeight,
  {
    message: 'Min weight must be less than max weight',
    path: ['maxWeight'],
  }
);

export type CreateSlabDto = z.infer<typeof createSlabSchema>;

/**
 * Create Promotion DTO
 */
export const createPromotionSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  type: promotionTypeSchema,
  startDate: z
    .string()
    .datetime('Invalid date format')
    .optional()
    .nullable(),
  endDate: z
    .string()
    .datetime('Invalid date format')
    .optional()
    .nullable(),
  isEnabled: z.boolean().default(true),
  slabs: z.array(createSlabSchema).optional(),
  percentageValue: z.number().positive().optional(),
  fixedValue: z.number().positive().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start < end;
    }
    return true;
  },
  {
    message: 'Start date must be before end date',
    path: ['endDate'],
  }
).refine(
  (data) => {
    // WEIGHTED type requires slabs
    if (data.type === 'WEIGHTED' && (!data.slabs || data.slabs.length === 0)) {
      return false;
    }
    return true;
  },
  {
    message: 'Slabs are required for WEIGHTED promotion type',
    path: ['slabs'],
  }
).refine(
  (data) => {
    // PERCENTAGE requires percentageValue
    if (data.type === 'PERCENTAGE' && !data.percentageValue) {
      return false;
    }
    return true;
  },
  {
    message: 'percentageValue is required for PERCENTAGE promotion type',
    path: ['percentageValue'],
  }
).refine(
  (data) => {
    // FIXED requires fixedValue
    if (data.type === 'FIXED' && !data.fixedValue) {
      return false;
    }
    return true;
  },
  {
    message: 'fixedValue is required for FIXED promotion type',
    path: ['fixedValue'],
  }
).refine(
  (data) => {
    // PERCENTAGE and FIXED should not have slabs
    if ((data.type === 'PERCENTAGE' || data.type === 'FIXED') && data.slabs && data.slabs.length > 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Slabs should not be provided for PERCENTAGE or FIXED promotion types',
    path: ['slabs'],
  }
);

export type CreatePromotionDto = z.infer<typeof createPromotionSchema>;

/**
 * Update Promotion DTO
 * Limited to: title, startDate, endDate only
 */
export const updatePromotionSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .optional(),
  startDate: z
    .string()
    .datetime('Invalid date format')
    .optional()
    .nullable(),
  endDate: z
    .string()
    .datetime('Invalid date format')
    .optional()
    .nullable(),
}).refine(
  (data) => {
    // Validate date range if both provided
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start < end;
    }
    return true;
  },
  {
    message: 'Start date must be before end date',
    path: ['endDate'],
  }
).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided for update',
  }
);

export type UpdatePromotionDto = z.infer<typeof updatePromotionSchema>;

/**
 * Toggle Promotion DTO
 */
export const togglePromotionSchema = z.object({
  isEnabled: z.boolean({
    required_error: 'isEnabled is required',
    invalid_type_error: 'isEnabled must be a boolean',
  }),
});

export type TogglePromotionDto = z.infer<typeof togglePromotionSchema>;

/**
 * Calculate Discount DTO
 */
export const calculateDiscountSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive'),
});

export type CalculateDiscountDto = z.infer<typeof calculateDiscountSchema>;
