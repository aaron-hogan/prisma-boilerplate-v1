import { getJwtClaims } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";
import UserMenu from "./user-menu";

/**
 * Server Component wrapper for the UserMenu
 * Fetches user data from server and passes it to the client component
 */
export default async function UserMenuWrapper() {
  // Get Supabase client
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  
  // Get user email
  const userEmail = user?.email || null;
  
  // Get the JWT claims which include the user's role
  const claims = await getJwtClaims();
  const userRole = claims?.app_role || 'USER';  // Default to USER if no role found
  
  return <UserMenu 
    userEmail={userEmail} 
    userRole={userRole} 
    isAuthenticated={isAuthenticated} 
  />;
}