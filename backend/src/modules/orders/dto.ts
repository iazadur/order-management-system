import { z } from 'zod';

/**
 * Order Item DTO
 */
export const orderItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive')
    .max(1000, 'Quantity exceeds maximum allowed'),
});

/**
 * Customer Information DTO
 */
export const customerInfoSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters'),
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  phone: z
    .string()
    .max(20, 'Phone must be less than 20 characters')
    .optional()
    .nullable(),
  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .nullable(),
});

export type CustomerInfoDto = z.infer<typeof customerInfoSchema>;

/**
 * Create Order DTO
 */
export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, 'At least one item is required')
    .max(50, 'Maximum 50 items per order'),
  customerInfo: customerInfoSchema,
  promotionId: z.string().uuid('Invalid promotion ID').optional().nullable(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;

/**
 * Order Query Parameters DTO
 */
export const orderQuerySchema = z.object({
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional()
    .default('1'),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive().max(100))
    .optional()
    .default('10'),
  status: z
    .enum(['PENDING', 'CONFIRMED', 'PAID', 'FULFILLED', 'CANCELLED'])
    .optional(),
  sortBy: z.enum(['createdAt', 'total']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type OrderQueryDto = z.infer<typeof orderQuerySchema>;
