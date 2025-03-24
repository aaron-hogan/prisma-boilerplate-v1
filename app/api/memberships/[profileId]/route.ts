// app/api/memberships/[profileId]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { profileId: string } }
) {
  try {
    // Get the profile ID from the URL - no need to await params in Next.js 15+
    const profileId = params.profileId;
    
    // Get the authenticated user
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
    
    // Verify the user has permission (must be the owner or an admin)
    if (profile.id !== profileId && profile.appRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      );
    }
    
    // Find the membership
    const membership = await prisma.membership.findUnique({
      where: { profileId },
    });
    
    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Membership not found' },
        { status: 404 }
      );
    }
    
    // Set the end date to now (soft deletion)
    const now = new Date();
    await prisma.membership.update({
      where: { id: membership.id },
      data: { endDate: now }
    });
    
    // Update the profile role to USER
    await prisma.profile.update({
      where: { id: profileId },
      data: { appRole: 'USER' }
    });
    
    // Update JWT claims if it's the current user
    if (profileId === profile.id) {
      await supabase.auth.updateUser({
        data: { app_role: 'USER' }
      });
    }
    
    // Update all membership product purchases for this profile to be "deleted"
    await prisma.$executeRaw`
      UPDATE purchases 
      SET deleted_at = ${now} 
      WHERE profile_id = ${profileId} 
      AND product_id IN (
        SELECT id FROM products WHERE type = 'MEMBERSHIP'::\"ProductType\"
      )
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Membership cancelled successfully'
    });
  } catch (error: any) {
    console.error('Error revoking membership:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}