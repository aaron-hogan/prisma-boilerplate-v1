/**
 * Simplified Supabase middleware for Next.js
 * 
 * This middleware handles authentication and session refreshing.
 * It intercepts requests, refreshes sessions when needed, and manages redirects.
 * Updated for Next.js 15 async API requirements.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, NextRequest } from 'next/server';

export const createMiddlewareClient = async (request: NextRequest) => {
  const response = NextResponse.next();
  
  // Create a Supabase client specifically for middleware context
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Next.js 15: All cookie methods must be async
        async get(name) {
          return request.cookies.get(name)?.value;
        },
        async set(name, value, options) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        },
        async remove(name, options) {
          request.cookies.set(name, '');
          response.cookies.set(name, '', { ...options, maxAge: 0 });
        }
      }
    }
  );
  
  return { supabase, response };
};