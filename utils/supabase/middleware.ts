/**
 * Simplified Supabase middleware for Next.js
 * 
 * This middleware handles authentication and session refreshing.
 * It intercepts requests, refreshes sessions when needed, and manages redirects.
 * Updated for Next.js 15 async API requirements.
 * Updated to use recommended getAll/setAll cookie methods to avoid deprecation warnings.
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
        // Next.js 15: All cookie methods must be async with updated API
        async getAll() {
          return request.cookies.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value
          }));
        },
        async setAll(cookiesList) {
          cookiesList.forEach(cookie => {
            request.cookies.set(cookie.name, cookie.value);
            response.cookies.set(cookie.name, cookie.value, cookie.options);
          });
        }
      }
    }
  );
  
  return { supabase, response };
};