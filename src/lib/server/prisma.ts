import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

// Singleton pattern to avoid "too many connections" on Neon's free tier
// Connection pooling is critical for serverless/edge environments
const createPrismaClient = () => new PrismaClient({
    log: dev ? ['error', 'warn'] : ['error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

const prisma = (globalThis as any).__prisma ?? createPrismaClient();

if (dev) {
    // Reuse across HMR restarts in dev to avoid connection exhaustion
    (globalThis as any).__prisma = prisma;
}

export { prisma };
