// app/api/test-read-product/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Try to retrieve all products
    const products = await prisma.product.findMany({
      take: 10, // Limit to 10 products
    });
    
    return NextResponse.json({ 
      success: true, 
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Failed to read products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read products', details: error },
      { status: 500 }
    );
  }
}