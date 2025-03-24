import Link from "next/link";

/**
 * Admin Dashboard Page
 * 
 * This page serves as the main entry point for admin functionality.
 * It is protected by middleware and only accessible to users with ADMIN or STAFF roles.
 * 
 * The page provides navigation links to:
 * - Apples Management: For managing apple products (create, read, delete)
 * - Oranges Management: For managing orange products (create, read, delete)
 * 
 * Access control is enforced at multiple levels:
 * 1. Middleware prevents non-admin/staff users from accessing this route
 * 2. Layout components verify authentication
 * 3. Database RLS policies enforce permissions on data operations
 */
export default function AdminDashboardPage() {
   return (
     <div className="w-full">
       <h1 className="text-2xl font-bold mb-4">Staff & Admin Dashboard</h1>
       <p>This page is accessible only to users with Admin or Staff roles</p>
       
       <div className="mt-4">
         <p>
           <Link href="/admin/apples" className="text-blue-500 hover:underline">
             Apples Management
           </Link>
         </p>
         <p className="mt-2">
           <Link href="/admin/oranges" className="text-blue-500 hover:underline">
             Oranges Management
           </Link>
         </p>
       </div>
     </div>
   );
}