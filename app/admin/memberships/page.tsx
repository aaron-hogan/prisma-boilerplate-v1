import { redirect } from "next/navigation";

/**
 * Memberships Management Redirect
 * 
 * Redirects to the user dashboard with the admin tab active.
 */
export default function MembershipsManagementPage() {
  return redirect("/user?tab=admin");
}