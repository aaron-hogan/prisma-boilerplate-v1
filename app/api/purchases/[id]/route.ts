// app/api/purchases/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

/**
 * API endpoint for soft deleting a purchase
 * 
 * This endpoint:
 * 1. Verifies the authenticated user
 * 2. Checks if the user owns the purchase or is an admin
 * 3. Soft deletes the purchase by setting deletedAt timestamp
 * 4. For membership purchases, checks if the user has any other active memberships
 *    and downgrades them to USER if not
 */
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
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Find the profile for permission check
    const profile = await prisma.profile.findUnique({
      where: { authUserId: user.id },
    });
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    // Find the purchase with product information
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { product: true }
    });
    
    if (!purchase) {
      return NextResponse.json(
        { success: false, error: 'Purchase not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission (owner or admin)
    if (purchase.profileId !== profile.id && profile.appRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      );
    }
    
    // Check if already deleted (using raw query since deletedAt field might not be in the schema)
    const alreadyDeleted = await prisma.$queryRaw`
      SELECT deleted_at IS NOT NULL FROM purchases WHERE id = ${id}
    `;
    
    if (alreadyDeleted[0]?.deleted_at) {
      return NextResponse.json(
        { success: false, error: 'Purchase already cancelled' },
        { status: 400 }
      );
    }
    
    // Soft delete the purchase using raw SQL to bypass schema issues
    const now = new Date();
    await prisma.$executeRaw`
      UPDATE purchases SET deleted_at = ${now} WHERE id = ${id}
    `;
    
    // Special handling for membership purchases
    if (purchase.product.type === 'MEMBERSHIP') {
      // Check if user has any other active membership purchases
      const otherActiveMemberships = await prisma.$queryRaw`
        SELECT COUNT(*) FROM purchases 
        WHERE profile_id = ${purchase.profileId}
        AND id != ${id} 
        AND deleted_at IS NULL
        AND product_id IN (
          SELECT id FROM products 
          WHERE type = 'MEMBERSHIP'::\"ProductType\" 
          AND deleted_at IS NULL
        )
      `;
      
      const hasOtherMemberships = Number(otherActiveMemberships[0]?.count) > 0;
      
      // If no other active memberships, downgrade to USER and set membership end date
      if (!hasOtherMemberships) {
        // Update user role to USER
        await prisma.profile.update({
          where: { id: purchase.profileId },
          data: { appRole: 'USER' }
        });
        
        // Update membership end date to now
        const membership = await prisma.membership.findUnique({
          where: { profileId: purchase.profileId }
        });
        
        if (membership) {
          await prisma.membership.update({
            where: { id: membership.id },
            data: { endDate: now }
          });
        }
        
        // Update JWT claims if it's the current user
        if (purchase.profileId === profile.id) {
          await supabase.auth.updateUser({
            data: { app_role: 'USER' }
          });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: purchase.product.type === 'MEMBERSHIP' 
        ? 'Membership cancelled successfully' 
        : 'Purchase cancelled successfully'
    });
  } catch (error: any) {
    console.error('Error cancelling purchase:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}