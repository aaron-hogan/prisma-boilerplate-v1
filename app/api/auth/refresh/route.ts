/**
 * Auth Token Refresh API Endpoint
 * 
 * This endpoint explicitly refreshes the JWT token using the Supabase server client.
 * It's a critical part of ensuring that JWT claims are updated after role changes.
 */

import { createClient } from '@/utils/supabase/simplified-server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get the Supabase client
    const supabase = await createClient();
    
    // Get the current user (this will also refresh the session)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Explicitly refresh the session to update JWT claims
    const { error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      return NextResponse.json(
        { error: 'Failed to refresh session', details: refreshError.message },
        { status: 500 }
      );
    }
    
    // Get user's profile to check current role in database
    const profile = await prisma.profile.findUnique({
      where: { authUserId: user.id },
      include: { membership: true }
    });
    
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }
    
    // Verify JWT claims match database role (sanity check)
    const userRole = user.app_metadata?.app_role || 'USER';
    
    if (userRole !== profile.appRole) {
      // If there's a mismatch, update JWT claims to match database
      await supabase.auth.updateUser({
        data: { app_role: profile.appRole }
      });
      
      // Refresh session again to ensure claims are updated
      await supabase.auth.refreshSession();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Session refreshed successfully',
      role: profile.appRole
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}