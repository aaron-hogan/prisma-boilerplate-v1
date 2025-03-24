/**
 * Simplified Supabase client for server environments
 * 
 * This module creates a Supabase client for use in server components and API routes.
 * It properly handles cookies from the Next.js API environment.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // This can happen in Server Components when accessing cookies
            // It's expected and can be safely ignored as middleware will handle cookies
          }
        },
        remove(name, options) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            // This can happen in Server Components when accessing cookies
            // It's expected and can be safely ignored as middleware will handle cookies
          }
        }
      }
    }
  );
};