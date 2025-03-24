import { redirect } from "next/navigation";

/**
 * Admin Dashboard Redirect
 * 
 * This is a simplified approach that redirects to the user dashboard
 * with the admin tab active. This eliminates duplicate code and
 * centralizes the admin functionality in one place.
 */
export default function AdminDashboardPage() {
  return redirect("/user?tab=admin");
}