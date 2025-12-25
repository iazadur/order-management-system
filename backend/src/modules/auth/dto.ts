import { z } from 'zod';

/**
 * DTOs and validation schemas for authentication
 */

// Register schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Refresh token schema
export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Type exports
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshDto = z.infer<typeof refreshSchema>;

// Request metadata
export interface RequestMetadata {
  ip?: string;
  userAgent?: string;
  device?: string;
}

// Token payload
export interface TokenPayload {
  userId: string;
  email: string;
}

// Refresh token data
export interface RefreshTokenData {
  token: string;
  tokenHash: string;
  expiresAt: Date;
}

// Auth tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// User public data
export interface UserPublic {
  id: string;
  email: string;
  isVerified: boolean;
  createdAt: Date;
}

// Auth response
export interface AuthResponse {
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
}

// Refresh response
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

