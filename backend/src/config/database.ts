import { PrismaClient } from '@prisma/client';
import logger from './logger';

/**
 * Prisma Client singleton instance
 * Use this throughout the application for database operations
 */
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
});

// Log queries in development
// TODO: maybe disable in production for performance
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query' as never, (e: any) => {
    // console.log('DB Query:', e.query); // too verbose, using logger instead
    logger.debug('Query', { query: e.query, duration: `${e.duration}ms` });
  });
}

// Log errors
prisma.$on('error' as never, (e: any) => {
  logger.error('Prisma Error', { error: e });
});

// Log warnings
prisma.$on('warn' as never, (e: any) => {
  logger.warn('Prisma Warning', { warning: e });
});

/**
 * Connect to the database
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('📦 Database connection established');
  } catch (error) {
    logger.error('Database connection failed', { error });
    throw error;
  }
}

/**
 * Disconnect from the database
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('📦 Database disconnected');
}

export default prisma;

