// app/(admin)/apples/page.tsx
export default function ApplesManagementPage() {
   return (
     <div className="w-full">
       <h1 className="text-2xl font-bold mb-4">Apples Management</h1>
       <p>This page is accessible only to users with Admin role (delete) or Admin/Staff roles (create)</p>
     </div>
   );
 }