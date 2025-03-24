import { redirect } from "next/navigation";

/**
 * Apples Management Redirect
 * 
 * Redirects to the user dashboard with the admin tab active.
 */
export default function ApplesManagementPage() {
  return redirect("/user?tab=admin");
}