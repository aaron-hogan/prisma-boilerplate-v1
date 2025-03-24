// app/api/test-db-schema/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get a sample from each table
    const profileSample = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' AND table_schema = 'public'
    `;
    
    const productSample = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND table_schema = 'public'
    `;
    
    // Test creating a product with explicit casting
    const testProfile = await prisma.profile.findFirst();
    
    let testProductResult = null;
    let error = null;
    
    if (testProfile) {
      try {
        const testProduct = await prisma.product.create({
          data: {
            name: `Schema Test ${new Date().toISOString()}`,
            type: 'ORANGE',
            price: 2.99,
            createdBy: testProfile.id,
          },
        });
        testProductResult = testProduct;
      } catch (e: any) {
        error = {
          message: e.message,
          stack: e.stack
        };
      }
    }
    
    return NextResponse.json({
      profileSchema: profileSample,
      productSchema: productSample,
      testProfile: testProfile ? {
        id: testProfile.id,
        idType: typeof testProfile.id,
      } : null,
      testProductResult,
      error
    });
  } catch (error: any) {
    console.error('Schema test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Schema test failed', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}