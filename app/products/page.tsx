// app/products/page.tsx
import prisma from '@/lib/prisma';
import { createClient } from "@/utils/supabase/server";
import ProductList from "@/components/product-list";

export default async function ProductsPage() {
  // Check if user is authenticated and get their role
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  
  // Get user's profile to check role
  let userRole = 'USER'; // Default role
  
  if (user) {
    const profile = await prisma.profile.findUnique({
      where: { authUserId: user.id }
    });
    
    if (profile) {
      userRole = profile.appRole;
    }
  }
  
  // Check if user can see apples (member or higher)
  const canSeeApples = ['MEMBER', 'STAFF', 'ADMIN'].includes(userRole);
  
  // Fetch products based on user role
  const productsQuery = canSeeApples 
    ? prisma.product.findMany({ orderBy: { createdAt: 'desc' } }) // All products
    : prisma.product.findMany({      
        where: { type: 'ORANGE' },   // Only oranges for non-members
        orderBy: { createdAt: 'desc' }
      });
      
  const products = await productsQuery;
  
  // Filter products by type and serialize for client component (fixing Decimal issue)
  const serializedProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
    price: p.price.toString(), // Convert Decimal to string
    createdAt: p.createdAt.toISOString(),
  }));
  
  const apples = serializedProducts.filter(p => p.type === 'APPLE');
  const oranges = serializedProducts.filter(p => p.type === 'ORANGE');

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      
      {canSeeApples ? (
        // Member or higher view - show both product types
        <div className="mb-6">
          <p className="mb-6">Browse our complete selection of fruits</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Apples</h2>
              <p className="mb-4">Member exclusive products</p>
              <ProductList products={apples} isAuthenticated={isAuthenticated} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-4">Oranges</h2>
              <p className="mb-4">Available to everyone</p>
              <ProductList products={oranges} isAuthenticated={isAuthenticated} />
            </div>
          </div>
        </div>
      ) : (
        // Non-member view - only show oranges
        <div>
          <p className="mb-6">Browse our selection of oranges - available to everyone</p>
          <ProductList products={oranges} isAuthenticated={isAuthenticated} />
          
          <div className="mt-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Member Benefits</h3>
            <p>Become a member to access our exclusive apple products!</p>
          </div>
        </div>
      )}
    </div>
  );
}