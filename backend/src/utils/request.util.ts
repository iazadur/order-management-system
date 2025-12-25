import { Request } from 'express';
import { RequestMetadata } from '../modules/auth/dto';

/**
 * Extract request metadata (IP, user agent, etc.)
 */
export function extractRequestMetadata(req: Request): RequestMetadata {
    return {
        ip: req.ip,
        userAgent: req.headers['user-agent'] || undefined,
        device: undefined,
    };
}

/**
 * Extract refresh token from request (cookie or body)
 */
export function extractRefreshToken(req: Request): string | undefined {
    return req.cookies?.refreshToken || req.body?.refreshToken;
}

