// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object to prevent
// exhausting your database connection limit during development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'production' 
    ? ['error', 'warn'] 
    : ['query', 'error', 'warn'], // Full logs in development, minimal in production
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;