import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in Client Components (browser environment).
 * 
 * This function:
 * 1. Creates a client-side Supabase client using createBrowserClient from @supabase/ssr
 * 2. Uses environment variables accessible to the browser (prefixed with NEXT_PUBLIC_)
 * 3. Automatically handles auth state and token refresh in the browser context
 * 
 * Use this client when:
 * - Making Supabase calls from React Client Components (use client directive)
 * - Setting up realtime subscriptions which only work client-side
 * - Implementing interactive features that require immediate feedback
 * 
 * Note: The browser client automatically handles cookies through the browser's
 * built-in cookie storage mechanisms.
 * 
 * @returns A Supabase client configured for client-side usage
 */
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
