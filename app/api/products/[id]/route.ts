// app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { AppError, ErrorType, logError, createErrorResponse } from '@/utils/error-handler';

// API handler for soft deleting a product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Authentication check 
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new AppError(ErrorType.UNAUTHORIZED, 'Not authenticated');
    }
    
    // Find the profile for permission check
    const profile = await prisma.profile.findUnique({
      where: { authUserId: user.id },
    });
    
    if (!profile) {
      throw new AppError(ErrorType.NOT_FOUND, 'Profile not found');
    }
    
    // Find the product
    const product = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) {
      throw new AppError(ErrorType.NOT_FOUND, 'Product not found');
    }
    
    // Check if user has permission
    if (product.createdBy !== profile.id && profile.appRole !== 'ADMIN') {
      throw new AppError(ErrorType.FORBIDDEN, 'Permission denied');
    }
    
    // Check if product has been purchased
    const purchaseCount = await prisma.purchase.count({
      where: { productId: id }
    });
    
    // Check if the product has any active (non-cancelled) purchases
    const activePurchasesCount = await prisma.purchase.count({
      where: { 
        productId: id,
        deletedAt: null // Not cancelled
      }
    });
    
    // Prevent deletion of any product that has active purchases
    if (activePurchasesCount > 0) {
      let errorMessage = 'Cannot delete a product that has active purchases.';
      
      if (product.type === 'MEMBERSHIP') {
        errorMessage = 'Cannot delete a membership product that has active subscribers. Users must cancel their memberships first.';
      } else {
        errorMessage = `Cannot delete this ${product.type.toLowerCase()} because it has active purchases. Users must cancel their purchases first.`;
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage
        },
        { status: 400 }
      );
    }
    
    // Special handling for membership products - this only runs if there are no active purchases
    if (product.type === 'MEMBERSHIP') {
      // Double-check for active memberships (belt and suspenders approach)
      const activeMemberships = await prisma.purchase.count({
        where: { 
          productId: id,
          deletedAt: null, // Not cancelled
          profile: {
            membership: {
              endDate: {
                gt: new Date() // Active membership (end date in the future)
              }
            }
          }
        }
      });
      
      // If there are active memberships, prevent deletion
      if (activeMemberships > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Cannot delete a membership product that has active subscribers. Users must cancel their memberships first.' 
          },
          { status: 400 }
        );
      }
      
      // Get profiles that have purchased this membership
      const purchasedProfiles = await prisma.purchase.findMany({
        where: { 
          productId: id,
          deletedAt: null // Only consider active purchases
        },
        select: { profile: { select: { id: true, authUserId: true } } }
      });

      // For each profile, end their membership and demote to USER if needed
      for (const purchase of purchasedProfiles) {
        const profileId = purchase.profile.id;
        
        // First, find the membership for this profile
        const membership = await prisma.membership.findUnique({
          where: { profileId }
        });
        
        if (membership) {
          // Set end date to now (ending the membership)
          await prisma.membership.update({
            where: { id: membership.id },
            data: { endDate: new Date() }
          });
        }
        
        // Check if user has purchased any other active MEMBERSHIP products
        const otherMembershipPurchases = await prisma.purchase.count({
          where: {
            profileId,
            productId: { not: id },
            deletedAt: null, // Not cancelled
            product: {
              type: 'MEMBERSHIP',
              deletedAt: null // Not deleted product
            }
          }
        });
        
        // If no other membership purchases, demote user to USER role
        if (otherMembershipPurchases === 0) {
          await prisma.profile.update({
            where: { id: profileId },
            data: { appRole: 'USER' }
          });
          
          // Update their JWT claims if it's the current user
          if (profileId === profile.id) {
            await supabase.auth.updateUser({
              data: { app_role: 'USER' }
            });
          } else if (purchase.profile.authUserId) {
            // For other users, update their JWT claims using admin API
            try {
              await supabase.auth.admin.updateUserById(purchase.profile.authUserId, {
                app_metadata: { app_role: 'USER' }
              });
            } catch (err) {
              console.error('Error updating user JWT claims:', err);
            }
          }
        }
      }
    }
    
    // Update the product with deletedAt timestamp (soft deletion)
    const softDeletedProduct = await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: purchaseCount > 0 
        ? 'Product archived successfully' // Better messaging for purchased products
        : 'Product removed successfully',
    });
  } catch (error) {
    logError(error, 'DELETE /api/products/[id]');
    
    const errorResponse = createErrorResponse(error);
    
    return NextResponse.json(
      { success: false, ...errorResponse },
      { status: errorResponse.status }
    );
  }
}