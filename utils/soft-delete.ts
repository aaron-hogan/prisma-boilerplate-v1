// utils/soft-delete.ts
import { PrismaClient } from '@prisma/client';
import prisma from '@/lib/prisma';
import { activeFilter } from './filters';
import { AppError, ErrorType, logError } from './error-handler';

// Utility function to standardize soft delete operations with validation
export async function softDeleteProduct(
  id: string, 
  userId: string,
  tx?: any // PrismaClient or transaction
) {
  const client = tx || prisma;
  
  try {
    // Get user profile for permission check
    const profile = await client.profile.findUnique({
      where: { authUserId: userId }
    });
    
    if (!profile) {
      throw new AppError(ErrorType.NOT_FOUND, 'Profile not found');
    }
    
    // Get product
    const product = await client.product.findUnique({
      where: { id }
    });
    
    if (!product) {
      throw new AppError(ErrorType.NOT_FOUND, 'Product not found');
    }
    
    // Permission check
    if (product.createdBy !== profile.id && profile.appRole !== 'ADMIN') {
      throw new AppError(ErrorType.FORBIDDEN, 'Permission denied');
    }
    
    // Perform soft delete
    return client.product.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  } catch (error) {
    // Log the error but rethrow it for handling at the API layer
    if (!(error instanceof AppError)) {
      logError(error, 'softDeleteProduct');
      throw new AppError(ErrorType.INTERNAL, 'Failed to delete product');
    }
    throw error;
  }
}