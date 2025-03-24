// app/member/page.tsx

/**
 * Member Dashboard Page - Redirects to the user dashboard with the member tab active
 * 
 * This page is protected by middleware and only accessible to users with MEMBER, ADMIN, or STAFF roles.
 */

import { redirect } from "next/navigation";

export default function MemberPage() {
  // Redirect to the user dashboard with the member tab active
  return redirect("/user?tab=member");
}