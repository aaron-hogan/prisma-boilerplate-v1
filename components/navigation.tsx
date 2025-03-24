import { getJwtClaims } from "@/utils/auth";
import MainNav from "./main-nav";

/**
 * Server Component that fetches the user's role and passes it to the client-side navigation
 */
export default async function Navigation() {
  // Get the JWT claims which include the user's role
  const claims = await getJwtClaims();
  const userRole = claims?.app_role || 'USER';  // Default to USER if no role found
  
  return <MainNav userRole={userRole} />;
}