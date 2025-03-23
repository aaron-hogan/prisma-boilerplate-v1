// app/(public)/products/page.tsx
export default function PublicProductsPage() {
   return (
     <div className="w-full">
       <h1 className="text-2xl font-bold mb-4">Public Products Page</h1>
       <p>This page is accessible to everyone (unauthenticated users included)</p>
     </div>
   );
 }