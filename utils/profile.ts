// utils/profile.ts
/**
 * User profile management utilities
 * 
 * This file handles the synchronization between Supabase Auth users
 * and our application's profile system in the database.
 * 
 * The profile system:
 * 1. Links auth users with application-specific data
 * 2. Stores role information used for RBAC
 * 3. Enables custom JWT claims via the custom_access_token_hook
 */
import { User } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";
// Import only the client-side createClient
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Type definition for user details returned by the getUserDetails function
 */
export interface UserDetails {
  profileId: string;
  userId: string;
  email?: string;
  role: string;
  createdAt: Date;
}

/**
 * Server-only function: Retrieves user details from a profile ID.
 * This function should only be used in server components or route handlers.
 * For client components, use getCreatorInfo instead.
 * 
 * NOTE: This function is commented out because it requires server components.
 * Uncomment and use it only in server contexts.
 */
/* 
export async function getUserDetails(profileId: string): Promise<UserDetails | null> {
  try {
    // First, get the profile to find the auth user ID
    const profile = await prisma.profile.findUnique({
      where: { id: profileId }
    });
    
    if (!profile) {
      console.error(`Profile with ID ${profileId} not found`);
      return null;
    }
    
    // You would use server-side supabase client here
    // but this pattern isn't supported in client components
    
    // Return basic profile info since we can't access auth user data in this context
    return {
      profileId: profile.id,
      userId: profile.authUserId,
      role: profile.appRole,
      createdAt: profile.createdAt,
    };
    
  } catch (error) {
    console.error(`Error in getUserDetails: ${error}`);
    return null;
  }
}
*/

/**
 * Client-side function to get creator info for a product
 * This function works with the Supabase client in browser context
 * 
 * @param supabase - Supabase client instance
 * @param profileId - The profile ID to get information for
 * @returns Promise resolving to a simplified creator object or null
 */
export async function getCreatorInfo(supabase: SupabaseClient, profileId: string) {
  try {
    // First get the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('auth_user_id, app_role')
      .eq('id', profileId)
      .single();
    
    if (profileError || !profile) {
      // Silent failure in production, minimal logging in development
      if (process.env.NODE_ENV !== 'production' && profileError) {
        console.error(`Profile fetch error: ${profileError.message}`);
      }
      return null;
    }
    
    // For client components, we can't reliably get the email through auth.getUser
    // So we'll use the auth_user_id as the display name with a nice format
    const shortId = profile.auth_user_id.substring(0, 8) + "...";
    
    return {
      profileId: profileId,
      userId: profile.auth_user_id,
      role: profile.app_role,
      displayName: `User ${shortId}`
    };
    
  } catch (error) {
    // Silent failure in production, minimal logging in development
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Creator info error: ${error}`);
    }
    return null;
  }
}

/**
 * Ensures a user has a corresponding profile in our database
 * 
 * This function is a critical part of our auth flow:
 * - Called after successful authentication
 * - Creates a profile record if one doesn't exist
 * - Links the Supabase Auth user ID with our application profile
 * - Sets up the user's role which gets added to JWT claims
 * 
 * The profile record is essential for:
 * 1. Role-based access control (via app_role)
 * 2. Adding custom claims to the JWT
 * 3. Storing application-specific user data
 * 
 * @param user - The authenticated Supabase user object
 * @returns The user's profile or null if creation failed
 * 
 * Security note: This function uses a fail-open approach (returns null on error)
 * to prevent authentication failures, since profiles can be created later.
 * Critical systems might want to use fail-closed instead.
 */
export async function ensureUserProfile(user: User) {
  if (!user?.id) {
    // Silent failure - no logging needed for expected conditions
    return null;
  }
  
  // Profile synchronization for user
  try {
    // Check if profile already exists
    let profile = await prisma.profile.findUnique({
      where: { authUserId: user.id }
    });
    
    // If profile doesn't exist, create it with default USER role
    // The schema.prisma defines AppRole.USER as the default value
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          authUserId: user.id,
          // AppRole.USER is the default as specified in the schema
        }
      });
    }
    
    return profile;
  } catch (error) {
    // In production, you might want to use a proper logging service
    // For now, keeping minimal error logging for critical failures
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Profile creation error: ${error}`);
    }
    // Don't throw, so the auth flow can continue even if profile creation fails
    // The user can still authenticate, and we can try to create the profile later
    return null;
  }
}