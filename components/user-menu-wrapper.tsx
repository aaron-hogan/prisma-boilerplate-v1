import { getAuthData } from "@/utils/auth-data";
import UserMenu from "./user-menu";

/**
 * Server Component wrapper for the UserMenu
 * Fetches user data from server and passes it to the client component
 */
export default async function UserMenuWrapper() {
  // Get authentication data using shared utility
  const { isAuthenticated, userEmail, userRole } = await getAuthData();
  
  return <UserMenu 
    userEmail={userEmail} 
    userRole={userRole} 
    isAuthenticated={isAuthenticated} 
  />;
}