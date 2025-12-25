/**
 * Application-wide constants
 * Centralized configuration values to avoid magic numbers
 */

/**
 * Password hashing configuration
 */
export const PASSWORD_HASH_CONFIG = {
    MEMORY_COST: 65536, // 64 MB
    TIME_COST: 3,
    PARALLELISM: 4,
} as const;

/**
 * Token configuration
 */
export const TOKEN_CONFIG = {
    ISSUER: 'auth-backend',
    AUDIENCE: 'auth-backend-users',
    REFRESH_TOKEN_BYTES: 32,
} as const;

/**
 * Validation limits
 */
export const VALIDATION_LIMITS = {
    MAX_TITLE_LENGTH: 255,
    MIN_PASSWORD_LENGTH: 8,
    MAX_EMAIL_LENGTH: 255,
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

/**
 * Order statuses
 */
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PAID: 'PAID',
    FULFILLED: 'FULFILLED',
    CANCELLED: 'CANCELLED',
} as const;

/**
 * Promotion types
 */
export const PROMOTION_TYPE = {
    PERCENTAGE: 'PERCENTAGE',
    FIXED: 'FIXED',
    WEIGHTED: 'WEIGHTED',
} as const;

