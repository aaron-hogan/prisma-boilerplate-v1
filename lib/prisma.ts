// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object to prevent
// exhausting your database connection limit during development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'], // Add this for debugging
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;