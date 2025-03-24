import { redirect } from "next/navigation";

/**
 * Oranges Management Redirect
 * 
 * Redirects to the user dashboard with the admin tab active.
 */
export default function OrangesManagementPage() {
  return redirect("/user?tab=admin");
}