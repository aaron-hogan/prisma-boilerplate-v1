/**
 * Simplified Supabase client for server environments
 * 
 * This module creates a Supabase client for use in server components and API routes.
 * It properly handles cookies from the Next.js API environment with async support.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name) {
          const cookie = await cookieStore.get(name);
          return cookie?.value;
        },
        async set(name, value, options) {
          try {
            await cookieStore.set(name, value, options);
          } catch (error) {
            // This can happen in Server Components when accessing cookies
            // It's expected and can be safely ignored as middleware will handle cookies
          }
        },
        async remove(name, options) {
          try {
            await cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            // This can happen in Server Components when accessing cookies
            // It's expected and can be safely ignored as middleware will handle cookies
          }
        }
      }
    }
  );
};