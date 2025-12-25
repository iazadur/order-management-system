import { z } from 'zod';

/**
 * Create Product DTO
 */
export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(255, 'Slug must be less than 255 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  sku: z.string()
    .min(1, 'SKU is required')
    .max(100, 'SKU must be less than 100 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional().nullable(),
  price: z.number()
    .positive('Price must be greater than 0')
    .max(9999999.99, 'Price exceeds maximum allowed value'),
  weight: z.number()
    .int('Weight must be an integer')
    .nonnegative('Weight must be non-negative')
    .default(0),
  currency: z.string()
    .length(3, 'Currency must be a 3-letter code')
    .default('BDT'),
  isActive: z.boolean().default(true),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;

/**
 * Update Product DTO
 */
export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/).optional(),
  sku: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional().nullable(),
  price: z.number().positive().max(9999999.99).optional(),
  weight: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided for update',
  }
);

export type UpdateProductDto = z.infer<typeof updateProductSchema>;

/**
 * Product Query Parameters DTO
 */
export const productQuerySchema = z.object({
  includeDisabled: z
    .preprocess(
      (val) => (val === 'true' ? true : val === 'false' ? false : false),
      z.boolean()
    )
    .default(false),
});

export type ProductQueryDto = z.infer<typeof productQuerySchema>;

/**
 * Toggle Product DTO
 */
export const toggleProductSchema = z.object({
  isEnabled: z.boolean({
    required_error: 'isEnabled is required',
    invalid_type_error: 'isEnabled must be a boolean',
  }),
});

export type ToggleProductDto = z.infer<typeof toggleProductSchema>;

