// app/api/cron/check-memberships/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

/**
 * Scheduled API endpoint to check for expired memberships
 * This would typically be called by a cron job set up with a service like Vercel Cron
 * 
 * It identifies users with expired memberships and:
 * 1. Sets their role back to USER
 * 2. Updates their JWT claims in Supabase
 */
export async function GET() {
  try {
    // Find profiles with expired memberships (endDate in the past)
    const expiredMemberships = await prisma.membership.findMany({
      where: {
        endDate: {
          lt: new Date() // End date in the past
        }
      },
      include: {
        profile: true
      }
    });
    
    // Count of profiles that were updated
    let updatedCount = 0;
    
    // Loop through profiles with expired memberships
    for (const membership of expiredMemberships) {
      const profile = membership.profile;
      
      // Check if this profile has any non-expired memberships
      const activeCount = await prisma.membership.count({
        where: {
          profileId: profile.id,
          endDate: {
            gt: new Date() // End date in the future
          }
        }
      });
      
      // If there are no active memberships and the user is not already downgraded
      if (activeCount === 0 && profile.appRole === 'MEMBER') {
        // Update profile role to USER
        await prisma.profile.update({
          where: { id: profile.id },
          data: { appRole: 'USER' }
        });
        
        // Get Supabase admin client
        const supabase = await createClient();
        
        // Try to update user's JWT claims via admin-level update
        try {
          await supabase.auth.admin.updateUserById(profile.authUserId, {
            app_metadata: { app_role: 'USER' }
          });
        } catch (err) {
          console.error(`Error updating JWT claims for user ${profile.authUserId}:`, err);
          
          // Fallback to regular update
          await supabase.auth.updateUser({
            data: { app_role: 'USER' },
            authUserId: profile.authUserId
          });
        }
        
        updatedCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Checked memberships - ${expiredMemberships.length} expired, ${updatedCount} profiles downgraded to USER`,
    });
  } catch (error: any) {
    console.error('Error checking memberships:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}