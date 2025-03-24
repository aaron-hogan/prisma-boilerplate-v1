/**
 * Simplified Supabase client for server environments
 * 
 * This module creates a Supabase client for use in server components and API routes.
 * It properly handles cookies from the Next.js API environment with async support.
 * Updated to use recommended getAll/setAll cookie methods to avoid deprecation warnings.
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
        async getAll() {
          return cookieStore.getAll().map(cookie => ({ 
            name: cookie.name, 
            value: cookie.value 
          }));
        },
        async setAll(cookiesList) {
          try {
            cookiesList.forEach(cookie => {
              cookieStore.set(cookie.name, cookie.value, cookie.options);
            });
          } catch (error) {
            // This can happen in Server Components when accessing cookies
            // It's expected and can be safely ignored as middleware will handle cookies
          }
        }
      }
    }
  );
};