// app/products/page.tsx
import prisma from '@/lib/prisma';
import { createClient } from "@/utils/supabase/server";
import { purchaseProductAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export default async function PublicProductsPage() {
  // Fetch products directly with prisma
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Check if user is authenticated to show proper action buttons
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <p className="mb-6">Browse our selection of products</p>
      
      <div className="border rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-semibold mb-4">Available Products</h2>
        
        {products.length === 0 ? (
          <p>No products available yet.</p>
        ) : (
          <ul className="space-y-2">
            {products.map((product) => (
              <li key={product.id} className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{product.name}</span>
                    <div className="text-sm text-gray-500">Type: {product.type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${Number(product.price).toFixed(2)}</span>
                    
                    {/* Purchase form */}
                    <form action={purchaseProductAction}>
                      <input type="hidden" name="productId" value={product.id} />
                      <SubmitButton className="text-xs">
                        {isAuthenticated ? "Buy" : "Sign in to buy"}
                      </SubmitButton>
                    </form>
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