import { getAuthData } from "@/utils/auth-data";
import MainNav from "./main-nav";

/**
 * Server Component that fetches the user's role and auth status
 * and passes it to the client-side navigation
 */
export default async function Navigation() {
  // Get authentication data using shared utility
  const { isAuthenticated, userRole } = await getAuthData();
  
  return <MainNav userRole={userRole} isAuthenticated={isAuthenticated} />;
}