import { getJwtClaims } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";
import MainNav from "./main-nav";

/**
 * Server Component that fetches the user's role and auth status
 * and passes it to the client-side navigation
 */
export default async function Navigation() {
  // Get Supabase client
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  
  // Get the JWT claims which include the user's role
  const claims = await getJwtClaims();
  const userRole = claims?.app_role || 'USER';  // Default to USER if no role found
  
  return <MainNav userRole={userRole} isAuthenticated={isAuthenticated} />;
}