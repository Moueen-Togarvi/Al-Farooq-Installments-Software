import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

const prisma = (globalThis as any).prisma || new PrismaClient();

if (dev) {
    (globalThis as any).prisma = prisma;
}

export { prisma };
