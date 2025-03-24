/**
 * User Data API Endpoint
 * 
 * This endpoint:
 * 1. Checks authentication status
 * 2. Fetches fresh user data from the database
 * 3. Returns a consistent user data structure for client components
 */

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const supabase = await createClient();
  
  // Verify authentication
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  // Get profile with membership
  const profile = await prisma.profile.findUnique({
    where: { authUserId: user.id },
    include: { membership: true }
  });
  
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }
  
  // Get purchases with products
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
    total: p.total.toString(),
    quantity: p.quantity,
    createdAt: p.created_at.toISOString(),
    deletedAt: p.deleted_at ? p.deleted_at.toISOString() : null,
    product: {
      id: p.product_id,
      name: p.product_name,
      type: p.product_type,
      price: p.product_price.toString()
    }
  }));
  
  // Return user data in a consistent format
  return NextResponse.json({
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
    purchases
  });
}