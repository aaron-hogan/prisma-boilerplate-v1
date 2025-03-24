// app/(admin)/page.tsx
export default function AdminDashboardPage() {
   return (
     <div className="w-full">
       <h1 className="text-2xl font-bold mb-4">Staff & Admin Dashboard</h1>
       <p>This page is accessible only to users with Admin or Staff roles</p>
     </div>
   );
 }