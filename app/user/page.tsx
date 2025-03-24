// app/user/page.tsx
import { createClient } from "@/utils/supabase/server";
import prisma from '@/lib/prisma';
import { redirect } from "next/navigation";
import UserDashboard from "@/components/user-dashboard";

export default async function UserDashboardPage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  // Access searchParams safely - in Next.js 14 searchParams is a dynamic object
  // Get success message from URL if present
  const successMessage = searchParams?.success ? 
    (typeof searchParams.success === 'string' ? searchParams.success : null) : null;
  
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
  const purchases = await prisma.purchase.findMany({
    where: { profileId: profile.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });
  
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
      product: {
        id: p.product.id,
        name: p.product.name,
        type: p.product.type,
        price: p.product.price.toString()
      }
    }))
  };
  
  // Get the tab from URL if present - safely access the dynamic searchParams
  const tabParam = searchParams?.tab ? 
    (typeof searchParams.tab === 'string' ? searchParams.tab : null) : null;
  
  return <UserDashboard initialData={userData} successMessage={successMessage} initialTab={tabParam} />;
}