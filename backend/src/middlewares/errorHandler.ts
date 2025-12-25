import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import logger from '../config/logger';
import env from '../config/env';
import { AppError } from '../utils/errors';

/**
 * Global error handler middleware
 * Must be the last middleware in the chain
 */
export function errorHandler(
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    logger.warn('Validation error', {
      path: req.path,
      method: req.method,
      errors: err.errors,
    });

    const details = err.errors.reduce((acc, error) => {
      const path = error.path.join('.');
      if (!acc[path]) {
        acc[path] = [];
      }
      acc[path].push(error.message);
      return acc;
    }, {} as Record<string, string[]>);

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details,
    });
    return;
  }

  // Application errors
  if (err instanceof AppError) {
    logger.warn('Application error', {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      path: req.path,
      method: req.method,
    });

    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.warn('Prisma error', {
      code: err.code,
      path: req.path,
      method: req.method,
    });

    // Handle specific Prisma error codes
    switch (err.code) {
      case 'P2002':
        res.status(409).json({
          success: false,
          error: 'Resource already exists',
          code: 'DUPLICATE_ENTRY',
        });
        return;
      case 'P2025':
        res.status(404).json({
          success: false,
          error: 'Resource not found',
          code: 'NOT_FOUND',
        });
        return;
      default:
        break;
    }
  }

  // Unknown errors
  logger.error('Unhandled error', {
    error: err,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

