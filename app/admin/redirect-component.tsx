import { redirect } from "next/navigation";

/**
 * Admin Area Redirect Component
 * 
 * A reusable component that redirects all admin routes
 * to the user dashboard with the admin tab active.
 * 
 * This eliminates duplicate code across admin route pages.
 */
export default function AdminRedirect() {
  return redirect("/user?tab=admin");
}