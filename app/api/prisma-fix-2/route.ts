// app/api/prisma-fix-2/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * This is a utility endpoint to help fix purchase cancellations
 * It will attempt to get purchase information and resolve schema issues
 */
export async function GET() {
  try {
    // Get schema information
    const schemaInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'purchases'
    `;
    
    // Sample queries that should now work
    const activePurchasesCount = await prisma.$queryRaw`
      SELECT COUNT(*) FROM purchases WHERE deleted_at IS NULL
    `;
    
    const cancelledPurchasesCount = await prisma.$queryRaw`
      SELECT COUNT(*) FROM purchases WHERE deleted_at IS NOT NULL
    `;
    
    // Attempt to fix a specific purchase if id provided
    const purchaseId = 'no-id-provided';
    if (purchaseId !== 'no-id-provided') {
      await prisma.$executeRaw`
        UPDATE purchases SET deleted_at = CURRENT_TIMESTAMP WHERE id = ${purchaseId}
      `;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Schema information retrieved',
      schema: schemaInfo,
      stats: {
        activePurchases: activePurchasesCount[0].count,
        cancelledPurchases: cancelledPurchasesCount[0].count
      }
    });
  } catch (error: any) {
    console.error('Error retrieving schema info:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}