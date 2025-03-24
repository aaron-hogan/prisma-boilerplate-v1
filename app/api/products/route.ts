// app/api/products/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

// API handler for creating products
export async function POST(request: Request) {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Find the profile and check role
    const profile = await prisma.profile.findUnique({
      where: { authUserId: user.id },
    });
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission (ADMIN or STAFF role)
    if (!['ADMIN', 'STAFF'].includes(profile.appRole)) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Create the product using Prisma
    const product = await prisma.product.create({
      data: {
        name: body.name,
        type: body.type,
        price: body.price,
        createdBy: profile.id,
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      product,
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// API handler for listing products
export async function GET() {
  try {
    // Get all products using Prisma
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ 
      success: true, 
      products,
    });
  } catch (error: any) {
    console.error('Error listing products:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}