/**
 * Server-side authentication data helper
 * 
 * This utility provides a standardized way to fetch authentication data
 * used across server components like Navigation and UserMenuWrapper.
 */
import { getJwtClaims } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";
import { AuthData, AppRole } from "@/types";

/**
 * Gets authentication data from server context
 * - User authentication status
 * - User email
 * - User role from JWT claims
 * - User ID
 * 
 * @returns Promise resolving to an AuthData object
 */
export async function getAuthData(): Promise<AuthData> {
  // Get Supabase client
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  
  // Get user email
  const userEmail = user?.email || null;
  
  // Get user ID
  const userId = user?.id || null;
  
  // Get the JWT claims which include the user's role
  const claims = await getJwtClaims();
  const userRole = (claims?.app_role as AppRole) || 'USER';  // Default to USER if no role found
  
  return {
    isAuthenticated,
    userEmail,
    userRole,
    userId
  };
}