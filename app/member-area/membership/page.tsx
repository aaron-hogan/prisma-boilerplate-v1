import React from "react";

// app/(member)/membership/page.tsx
export default function MembershipPage() {
   return (
     <div className="w-full">
       <h1 className="text-2xl font-bold mb-4">Membership Management</h1>
       <p>This page is accessible only to users with Member role or higher</p>
     </div>
   );
 }