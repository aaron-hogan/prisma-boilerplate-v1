// app/member-dashboard/page.tsx
import { redirect } from "next/navigation";

/**
 * Special route that redirects directly to the user dashboard with the member tab active
 * This route bypasses the generic redirect in purchases/page.tsx
 */
export default function MemberDashboardPage() {
  // Direct redirect to the member tab in the user dashboard
  return redirect("/user?tab=member");
}