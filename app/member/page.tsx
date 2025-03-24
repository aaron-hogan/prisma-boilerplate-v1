import React from "react";
import Link from "next/link";

/**
 * Member Dashboard Page
 * 
 * This page serves as the main entry point for member functionality.
 * It is protected by middleware and only accessible to users with MEMBER, ADMIN, or STAFF roles.
 * 
 * The page provides navigation to:
 * - Membership Management: For viewing and managing membership details
 * 
 * Access control is enforced at multiple levels:
 * 1. Middleware prevents non-member users from accessing this route
 * 2. Database RLS policies enforce permissions on related data operations
 */
export default function MemberDashboardPage() {
   return (
     <div className="w-full">
       <h1 className="text-2xl font-bold mb-4">Member Dashboard</h1>
       <p>This page is accessible only to users with Member role or higher</p>
       <p className="mt-4">
         <Link href="/member/membership" className="text-blue-500 hover:underline">
           Membership Management
         </Link>
       </p>
     </div>
   );
}