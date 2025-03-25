/**
 * User Dashboard Page
 * 
 * This server component:
 * 1. Checks authentication status
 * 2. Fetches initial user data from the database
 * 3. Renders the dashboard component with clean props
 */

import { createClient } from "@/utils/supabase/server";
import prisma from '@/lib/prisma';
import { redirect } from "next/navigation";
import UserDashboard from "@/components/user-dashboard";
import { UrlMessageHandler } from "@/components/url-message-handler";

export default async function UserDashboardPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  // Await the searchParams promise in Next.js 15
  const params = await searchParams;
  
  // Get active tab from URL parameters
  const tab = params.tab as string | undefined;
  
  // Verify user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Find user's profile with membership data
  const profile = await prisma.profile.findUnique({
    where: { authUserId: user.id },
    include: { membership: true }
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
  const purchasesRaw = await prisma.$queryRaw`
    SELECT 
      p.id, p.quantity, p.total, p.created_at, p.deleted_at, p.profile_id, p.product_id,
      pr.id as product_id, pr.name as product_name, pr.type as product_type, pr.price as product_price
    FROM purchases p
    JOIN products pr ON p.product_id = pr.id
    WHERE p.profile_id = ${profile.id}
    ORDER BY p.created_at DESC
  `;
  
  // Transform raw query results to match expected structure
  const purchases = (purchasesRaw as any[]).map(p => ({
    id: p.id,
    quantity: p.quantity,
    total: p.total,
    createdAt: p.created_at,
    deletedAt: p.deleted_at,
    profileId: p.profile_id,
    productId: p.product_id,
    product: {
      id: p.product_id,
      name: p.product_name,
      type: p.product_type,
      price: p.product_price,
    }
  }));
  
  // Prepare data for the dashboard component
  const userData = {
    user: {
      email: user.email || '',
      id: user.id
    },
    profile: {
      id: profile.id,
      appRole: profile.appRole,
      createdAt: profile.createdAt.toISOString(),
      membership: profile.membership ? {
        startDate: profile.membership.startDate.toISOString(),
        endDate: profile.membership.endDate ? profile.membership.endDate.toISOString() : null
      } : null
    },
    purchases: purchases.map(p => ({
      id: p.id,
      total: p.total.toString(),
      quantity: p.quantity,
      createdAt: p.createdAt.toISOString(),
      deletedAt: p.deletedAt ? p.deletedAt.toISOString() : null,
      product: {
        id: p.product.id,
        name: p.product.name,
        type: p.product.type,
        price: p.product.price.toString()
      }
    }))
  };
  
  // Set active tab - consider role for default tab
  const isMember = ["MEMBER", "STAFF", "ADMIN"].includes(profile.appRole);
  const isAdmin = ["ADMIN", "STAFF"].includes(profile.appRole);

  // If tab specified in URL, use that, but ensure user has proper permissions
  let activeTab = "profile";
  if (tab === "admin" && isAdmin) {
    activeTab = "admin";
  } else if (tab === "member" && isMember) {
    activeTab = "member";
  } else if (tab === "purchases") {
    activeTab = "purchases";
  } else if (tab === "profile") {
    activeTab = "profile";
  } else if (isAdmin) {
    activeTab = "admin";
  } else if (isMember) {
    activeTab = "member";
  }
  
  // If admin tab was requested but user doesn't have permissions, show profile instead
  if (tab === "admin" && !isAdmin) {
    activeTab = "profile";
  }
  
  return (
    <>
      {/* Convert URL parameters to toast notifications */}
      <UrlMessageHandler />
      
      <UserDashboard 
        initialData={userData} 
        activeTab={activeTab}
      />
    </>
  );
}