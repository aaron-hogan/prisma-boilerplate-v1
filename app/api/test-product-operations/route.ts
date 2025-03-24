// app/api/test-product-operations/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
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
    
    // Find the profile
    const profile = await prisma.profile.findUnique({
      where: { authUserId: user.id },
    });
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    // Test 1: Create a product directly with Prisma
    const prismaProduct = await prisma.product.create({
      data: {
        name: `Prisma Test ${new Date().toISOString()}`,
        type: 'ORANGE',
        price: 1.99,
        createdBy: profile.id,
      },
    });
    
    // Test 2: Create a product with Supabase
    const { data: supabaseProduct, error: createError } = await supabase
      .from('products')
      .insert({
        name: `Supabase Test ${new Date().toISOString()}`,
        type: 'ORANGE',
        price: 2.99,
        created_by: profile.id,
      })
      .select()
      .single();
    
    // Test 3: Read the products
    const { data: readProducts, error: readError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    // Test 4: Try to update a product if we have one
    let updateResult = null;
    let updateError = null;
    
    if (prismaProduct) {
      const { data, error } = await supabase
        .from('products')
        .update({ price: 3.99 })
        .eq('id', prismaProduct.id)
        .select();
      
      updateResult = data;
      updateError = error;
    }
    
    // Test 5: Try to delete a product if we have one
    let deleteResult = null;
    let deleteError = null;
    
    if (supabaseProduct) {
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', supabaseProduct.id)
        .select();
      
      deleteResult = data;
      deleteError = error;
    }
    
    return NextResponse.json({
      user: { id: user.id },
      profile: { id: profile.id, type: typeof profile.id },
      prismaProduct,
      supabaseCreate: { 
        product: supabaseProduct, 
        error: createError 
      },
      supabaseRead: { 
        products: readProducts?.slice(0, 2), 
        count: readProducts?.length,
        error: readError 
      },
      supabaseUpdate: { 
        result: updateResult, 
        error: updateError 
      },
      supabaseDelete: { 
        result: deleteResult, 
        error: deleteError 
      }
    });
  } catch (error: any) {
    console.error('Test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test failed', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}