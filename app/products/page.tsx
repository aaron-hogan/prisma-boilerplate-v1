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
  
  // Fetch all products
  // Everyone can see oranges and memberships, but only members and above can see apples
  const products = await prisma.product.findMany({ 
    orderBy: { createdAt: 'desc' } 
  });
  
  // Filter products by type and serialize for client component (fixing Decimal issue)
  const serializedProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
    price: p.price.toString(), // Convert Decimal to string
    createdAt: p.createdAt.toISOString(),
  }));
  
  // Filter by product types
  const apples = serializedProducts.filter(p => p.type === 'APPLE');
  const oranges = serializedProducts.filter(p => p.type === 'ORANGE');
  const memberships = serializedProducts.filter(p => p.type === 'MEMBERSHIP');

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      
      {/* Membership Section - Always Visible */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Memberships</h2>
        <p className="mb-4">Become a member to access exclusive products and features</p>
        <ProductList products={memberships} isAuthenticated={isAuthenticated} />
      </div>
      
      {/* Product Sections */}
      {canSeeApples ? (
        // Member or higher view - show both apple and orange products
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-6">Fruit Products</h2>
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
          <h2 className="text-2xl font-bold mb-6">Fruit Products</h2>
          <p className="mb-6">Browse our selection of oranges - available to everyone</p>
          <ProductList products={oranges} isAuthenticated={isAuthenticated} />
        </div>
      )}
    </div>
  );
}