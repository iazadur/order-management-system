import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
});

if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query' as never, (e: any) => {
    logger.debug('Query', { query: e.query, duration: `${e.duration}ms` });
  });
}

prisma.$on('error' as never, (e: any) => {
  logger.error('Prisma Error', { error: e });
});

prisma.$on('warn' as never, (e: any) => {
  logger.warn('Prisma Warning', { warning: e });
});

export default prisma;

