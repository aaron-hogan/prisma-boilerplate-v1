// app/api/prisma-fix/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * This is an endpoint to help debug Prisma/database mismatches
 */
export async function GET() {
  try {
    // Try to run a query that uses deletedAt on a purchase
    const result = await prisma.$executeRaw`
      UPDATE purchases SET deleted_at = NULL WHERE id = 'non-existent-id'
    `;
    
    // Count purchases
    const totalPurchases = await prisma.purchase.count();
    
    // Attempt to filter purchases by deletedAt
    const activePurchases = await prisma.purchase.count({
      where: { 
        deletedAt: null
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Prisma testing complete',
      data: {
        totalPurchases,
        activePurchases
      }
    });
  } catch (error: any) {
    console.error('Prisma test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        hint: "The error above shows the mismatch between Prisma schema and database"
      },
      { status: 500 }
    );
  }
}