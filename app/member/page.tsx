// app/member/page.tsx
import prisma from '@/lib/prisma';
import { createClient } from "@/utils/supabase/server";
import { purchaseProductAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";

/**
 * Member Dashboard Page with Exclusive Products
 * 
 * This page shows members-only products (apples) as well as regular products.
 * It is protected by middleware and only accessible to users with MEMBER, ADMIN, or STAFF roles.
 * 
 * Access control is enforced at multiple levels:
 * 1. Middleware prevents non-member users from accessing this route
 * 2. Database RLS policies enforce permissions on related data operations
 */
export default async function MemberProductsPage() {
  // Fetch apples products for members
  const apples = await prisma.product.findMany({
    where: { type: 'APPLE' },
    orderBy: { createdAt: 'desc' },
  });
  
  // Fetch oranges products
  const oranges = await prisma.product.findMany({
    where: { type: 'ORANGE' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Member Products</h1>
      <p className="mb-6">As a member, you have access to both apples and oranges</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Apples section */}
        <div className="border rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-semibold mb-4">Apples</h2>
          
          {apples.length === 0 ? (
            <p>No apple products available yet.</p>
          ) : (
            <ul className="space-y-2">
              {apples.map((product) => (
                <li key={product.id} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{product.name}</span>
                    <span className="font-medium">${Number(product.price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm text-gray-500">Members only</div>
                    {/* Purchase form */}
                    <form action={purchaseProductAction}>
                      <input type="hidden" name="productId" value={product.id} />
                      <SubmitButton className="text-xs">Buy</SubmitButton>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Oranges section */}
        <div className="border rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-semibold mb-4">Oranges</h2>
          
          {oranges.length === 0 ? (
            <p>No orange products available yet.</p>
          ) : (
            <ul className="space-y-2">
              {oranges.map((product) => (
                <li key={product.id} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{product.name}</span>
                    <span className="font-medium">${Number(product.price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm text-gray-500">Public</div>
                    {/* Purchase form */}
                    <form action={purchaseProductAction}>
                      <input type="hidden" name="productId" value={product.id} />
                      <SubmitButton className="text-xs">Buy</SubmitButton>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}