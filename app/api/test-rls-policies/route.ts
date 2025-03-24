// app/api/test-rls-policies/route.ts
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
    
    // Test 1: Create a product with Supabase client
    const { data: createdProduct, error: createError } = await supabase
      .from('products')
      .insert({
        name: `RLS Test Create ${new Date().toISOString()}`,
        type: 'ORANGE',
        price: 1.99,
        created_by: profile.id,
      })
      .select()
      .single();
    
    // Get the ID of the product we just created
    const productId = createdProduct?.id;
    
    // Test 2: Read the product we just created
    const { data: readProduct, error: readError } = productId 
      ? await supabase.from('products').select('*').eq('id', productId).single()
      : { data: null, error: { message: 'No product ID' } };
    
    // Test 3: Update the product
    const { data: updatedProduct, error: updateError } = productId
      ? await supabase
          .from('products')
          .update({ price: 2.99 })
          .eq('id', productId)
          .select()
          .single()
      : { data: null, error: { message: 'No product ID' } };
    
    // Test 4: Delete the product
    const { data: deletedProduct, error: deleteError } = productId
      ? await supabase
          .from('products')
          .delete()
          .eq('id', productId)
          .select()
      : { data: null, error: { message: 'No product ID' } };
    
    // Also test products created by another user (if any)
    // For this, we'll try to update the first product that was not created by this user
    const { data: otherUsersProducts, error: otherError } = await supabase
      .from('products')
      .select('*')
      .neq('created_by', profile.id)
      .limit(1);
    
    let otherUpdateResult = null;
    let otherUpdateError = null;
    
    if (otherUsersProducts && otherUsersProducts.length > 0) {
      const otherProductId = otherUsersProducts[0].id;
      const { data, error } = await supabase
        .from('products')
        .update({ price: 9.99 })
        .eq('id', otherProductId)
        .select();
      
      otherUpdateResult = data;
      otherUpdateError = error;
    }
    
    return NextResponse.json({
      user: { id: user.id },
      profile: { id: profile.id, type: typeof profile.id },
      createTest: { 
        success: !createError, 
        product: createdProduct, 
        error: createError 
      },
      readTest: { 
        success: !readError, 
        product: readProduct, 
        error: readError 
      },
      updateTest: { 
        success: !updateError, 
        product: updatedProduct, 
        error: updateError 
      },
      deleteTest: { 
        success: !deleteError, 
        product: deletedProduct, 
        error: deleteError 
      },
      otherUserTest: {
        success: otherUsersProducts && otherUsersProducts.length > 0,
        hasProducts: otherUsersProducts && otherUsersProducts.length > 0,
        updateResult: otherUpdateResult,
        updateError: otherUpdateError
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