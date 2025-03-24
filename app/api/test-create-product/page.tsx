// app/api/test-create-product/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Hardcoded admin user ID from auth.users
    const adminUserId = 'f350f29a-c824-4a78-98de-f50726bc1f9f';
    
    // First, need to get the profile ID from the auth user ID
    const profile = await prisma.profile.findUnique({
      where: { authUserId: adminUserId },
    });
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Admin profile not found' },
        { status: 404 }
      );
    }
    
    // Create a test product with hardcoded data
    const product = await prisma.product.create({
      data: {
        name: `Test Product ${new Date().toISOString()}`,
        type: 'ORANGE', // Use the ProductType enum
        price: 2.99,
        createdBy: profile.id, // Use the profile ID, not the auth user ID
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      product,
      message: 'Product created successfully' 
    });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product', details: error },
      { status: 500 }
    );
  }
}