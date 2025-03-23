import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for use in Server Components, Server Actions, and Route Handlers.
 * 
 * This function:
 * 1. Creates a Supabase client that runs on the server using createServerClient from @supabase/ssr
 * 2. Uses Next.js cookies() API to get and set cookies for authentication
 * 3. Handles cookie management for Supabase authentication
 * 
 * The cookie handling is important because:
 * - Auth token refreshing requires cookie manipulation
 * - Server Components cannot directly set cookies in the response (they're read-only)
 * - The middleware is responsible for refreshing and persisting the session
 * 
 * @returns A Supabase client configured for server-side usage
 */
export const createClient = async () => {
  // Get access to the cookie store for the current request
  const cookieStore = await cookies();

  // Create and return a Supabase client configured for server-side usage
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Configure cookie handling for the Supabase client
      cookies: {
        // Gets all cookies from the cookie store
        getAll() {
          return cookieStore.getAll();
        },
        // Sets multiple cookies in the cookie store
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            // 
            // Server Components cannot modify cookies, but the middleware
            // will handle refreshing the auth session for us.
          }
        },
      },
    },
  );
};
