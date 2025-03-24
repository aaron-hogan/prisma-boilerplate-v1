import { getJwtClaims } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";
import MobileNav from "./mobile-nav";

/**
 * Server Component wrapper for the MobileNav
 * Fetches user data from server and passes it to the client component
 */
export default async function MobileNavWrapper() {
  // Get Supabase client
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  
  // Get the JWT claims which include the user's role
  const claims = await getJwtClaims();
  const userRole = claims?.app_role || 'USER';  // Default to USER if no role found
  
  return <MobileNav userRole={userRole} isAuthenticated={isAuthenticated} />;
}