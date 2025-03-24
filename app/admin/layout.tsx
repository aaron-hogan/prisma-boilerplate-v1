import { redirect } from "next/navigation";

/**
 * Admin Dashboard Redirect Layout
 * 
 * This layout simply redirects to the user dashboard with the admin tab active.
 * This approach eliminates duplicated code and permissions checking.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return redirect("/user?tab=admin");
}