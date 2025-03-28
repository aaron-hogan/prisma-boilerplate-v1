/**
 * Products Page
 * 
 * This page:
 * 1. Fetches products from the database
 * 2. Renders a clean products list with purchase buttons
 * 3. Uses the simplified purchase action
 */

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { purchaseProductAction } from '@/app/actions';
import { UrlMessageHandler } from '@/components/url-message-handler';

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await the searchParams promise in Next.js 15
  const params = await searchParams;
  
  // Get error message from URL if present
  const error = params.error as string | undefined;
  const success = params.success as string | undefined;
  
  // Get all products (not deleted ones)
  const products = await prisma.product.findMany({
    where: {
      deletedAt: null
    },
    orderBy: {
      type: 'asc'
    }
  });
  
  // Get current user (if logged in)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // If user is logged in, get their profile to check role
  let userRole = 'GUEST';
  if (user) {
    const profile = await prisma.profile.findUnique({
      where: { authUserId: user.id }
    });
    
    if (profile) {
      userRole = profile.appRole;
    }
  }
  
  // Check if user is a member
  const isMember = ['MEMBER', 'STAFF', 'ADMIN'].includes(userRole);
  
  return (
    <div className="container mx-auto py-8">
      {/* Convert URL parameters to toast notifications */}
      <UrlMessageHandler />
      
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      
      {products.length === 0 ? (
        <div className="border border-dashed rounded-lg p-10 text-center">
          <h2 className="text-xl font-semibold mb-2">No Products Available</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            There are currently no products available for purchase.
          </p>
          {user ? (
            <p className="text-sm text-muted-foreground">
              Signed in as {user.email}
            </p>
          ) : (
            <div className="flex justify-center gap-4 mt-4">
              <Button asChild variant="ghost">
                <a href="/sign-in">Sign In</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/sign-up">Sign Up</a>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="border rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-4">{product.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold">${Number(product.price).toFixed(2)}</span>
                <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">
                  {product.type}
                </span>
              </div>
              
              {/* Purchase button - with different behavior based on product type and user role */}
              {(product.type !== 'APPLE' || isMember) ? (
                <form action={purchaseProductAction}>
                  <input type="hidden" name="productId" value={product.id} />
                  <Button type="submit" className="w-full">
                    Purchase
                  </Button>
                </form>
              ) : (
                <div>
                  <Button disabled className="w-full mb-2">
                    Members Only
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    This product is only available to members
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}