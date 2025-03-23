// app/(member)/page.tsx
export default function MemberDashboardPage() {
   return (
     <div className="w-full">
       <h1 className="text-2xl font-bold mb-4">Member Dashboard</h1>
       <p>This page is accessible only to users with Member role or higher</p>
     </div>
   );
 }