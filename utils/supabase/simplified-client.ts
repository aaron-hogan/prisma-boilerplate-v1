'use client';

/**
 * Simplified Supabase client for browser environments
 * 
 * This module creates a Supabase client for use in client components.
 * It uses the browser-specific client which handles cookies automatically.
 */

import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => 
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );