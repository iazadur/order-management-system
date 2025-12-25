import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import crypto from 'crypto';
import { randomBytes } from 'crypto';
import env from '../config/env';
import prisma from './prisma';
import logger from '../config/logger';
import { TokenPayload, RefreshTokenData } from '../modules/auth/dto';
import { PASSWORD_HASH_CONFIG, TOKEN_CONFIG } from '../config/constants';

// Re-export types for backward compatibility
export type { TokenPayload, RefreshTokenData };

/**
 * Hash a password using Argon2
 * @param password - Plain text password to hash
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: PASSWORD_HASH_CONFIG.MEMORY_COST,
        timeCost: PASSWORD_HASH_CONFIG.TIME_COST,
        parallelism: PASSWORD_HASH_CONFIG.PARALLELISM,
    });
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    try {
        return await argon2.verify(hash, password);
    } catch (error) {
        logger.error('Password verification error', { error });
        return false;
    }
}

/**
 * Generate an access token (JWT)
 * @param payload - Token payload containing userId and email
 * @returns Signed JWT access token
 */
export function generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
        issuer: TOKEN_CONFIG.ISSUER,
        audience: TOKEN_CONFIG.AUDIENCE,
    });
}

/**
 * Generate a refresh token (random string, stored hashed in DB)
 */
/**
 * Generate a refresh token (random string, stored hashed in DB)
 * @returns Refresh token data including token, hash, and expiration
 */
export function generateRefreshToken(): RefreshTokenData {
    const token = randomBytes(TOKEN_CONFIG.REFRESH_TOKEN_BYTES).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + env.REFRESH_TOKEN_EXPIRES_IN);

    return {
        token,
        tokenHash,
        expiresAt,
    };
}

/**
 * Hash a refresh token for storage
 */
export function hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
            issuer: 'auth-backend',
            audience: 'auth-backend-users',
        }) as TokenPayload;
        return decoded;
    } catch (error) {
        logger.debug('Access token verification failed', { error });
        return null;
    }
}

/**
 * Store a refresh token in the database
 */
export async function storeRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    device?: string,
    ip?: string,
    userAgent?: string
): Promise<void> {
    await prisma.refreshToken.create({
        data: {
            userId,
            tokenHash,
            expiresAt,
            device,
            ip,
            userAgent,
        },
    });
}

/**
 * Find and validate a refresh token
 */
export async function validateRefreshToken(
    token: string
): Promise<{ userId: string; tokenId: string } | null> {
    const tokenHash = hashRefreshToken(token);

    const refreshToken = await prisma.refreshToken.findFirst({
        where: {
            tokenHash,
            revoked: false,
            expiresAt: {
                gt: new Date(),
            },
        },
        include: {
            user: true,
        },
    });

    if (!refreshToken) {
        return null;
    }

    return {
        userId: refreshToken.userId,
        tokenId: refreshToken.id,
    };
}

/**
 * Revoke a refresh token (used during rotation)
 */
export async function revokeRefreshToken(tokenId: string): Promise<void> {
    await prisma.refreshToken.update({
        where: { id: tokenId },
        data: { revoked: true },
    });
}

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
        where: {
            userId,
            revoked: false,
        },
        data: {
            revoked: true,
        },
    });
}

/**
 * Clean up expired refresh tokens (should be run periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
        where: {
            OR: [
                { expiresAt: { lt: new Date() } },
                { revoked: true },
            ],
        },
    });
    return result.count;
}

