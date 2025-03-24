// app/purchases/page.tsx
import { createClient } from "@/utils/supabase/server";
import prisma from '@/lib/prisma';
import { redirect } from "next/navigation";

export default async function PurchasesPage() {
  // Verify user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { authUserId: user.id }
  });
  
  if (!profile) {
    return (
      <div className="w-full p-4">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p>Unable to locate your user profile. Please contact support.</p>
      </div>
    );
  }
  
  // Fetch user's purchases with product details
  const purchases = await prisma.purchase.findMany({
    where: { profileId: profile.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });
  
  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Your Purchases</h1>
      <p className="mb-6">View your purchase history</p>
      
      <div className="border rounded-lg shadow-sm p-4">
        {purchases.length === 0 ? (
          <div className="py-4">
            <p>You haven't made any purchases yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {purchases.map((purchase) => (
              <li key={purchase.id} className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{purchase.product.name}</span>
                    <div className="text-sm text-gray-500">Type: {purchase.product.type}</div>
                    <div className="text-xs text-gray-500">
                      Purchased: {new Date(purchase.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold">${Number(purchase.total).toFixed(2)}</span>
                    <div className="text-xs text-gray-500">Qty: {purchase.quantity}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}