import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Count the number of profiles to check that Prisma can connect
    const count = await prisma.profile.count();
    
    return NextResponse.json({ 
      message: 'Prisma is connected to Supabase!', 
      profileCount: count 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to database' },
      { status: 500 }
    );
  }
}