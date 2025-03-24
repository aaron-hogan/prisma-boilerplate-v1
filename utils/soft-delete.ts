// utils/soft-delete.ts
import { PrismaClient } from '@prisma/client';
import prisma from '@/lib/prisma';

export const activeFilter = { deletedAt: null };

// Utility function to standardize soft delete operations with validation
export async function softDeleteProduct(
  id: string, 
  userId: string,
  tx?: any // PrismaClient or transaction
) {
  const client = tx || prisma;
  
  // Get user profile for permission check
  const profile = await client.profile.findUnique({
    where: { authUserId: userId }
  });
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  // Get product
  const product = await client.product.findUnique({
    where: { id }
  });
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Permission check
  if (product.createdBy !== profile.id && profile.appRole !== 'ADMIN') {
    throw new Error('Permission denied');
  }
  
  // Perform soft delete
  return client.product.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}