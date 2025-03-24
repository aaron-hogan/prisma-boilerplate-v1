/**
 * Simplified Supabase middleware for Next.js
 * 
 * This middleware handles authentication and session refreshing.
 * It intercepts requests, refreshes sessions when needed, and manages redirects.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, NextRequest } from 'next/server';

export const createMiddlewareClient = (request: NextRequest) => {
  const response = NextResponse.next();
  
  // Create a Supabase client specifically for middleware context
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        },
        remove(name, options) {
          request.cookies.set(name, '');
          response.cookies.set(name, '', { ...options, maxAge: 0 });
        }
      }
    }
  );
  
  return { supabase, response };
};