import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth Callback Route Handler for Supabase Server-Side Auth
 * 
 * This route is CRITICAL for the server-side auth flow. When a user:
 * - Signs up and clicks the confirmation link in their email
 * - Resets their password via the reset password link
 * - Signs in with a third-party OAuth provider
 * 
 * They are redirected here with an auth 'code' parameter. This code needs to be
 * exchanged for a session using the exchangeCodeForSession method.
 * 
 * The callback workflow:
 * 1. User gets redirected here with a temporary code in the URL
 * 2. We exchange this code for a valid session (creates cookies)
 * 3. We redirect the user to either:
 *    - A specific page requested in the redirect_to parameter
 *    - Or the default protected area
 * 
 * @param request - The incoming HTTP request
 * @returns A redirect response after processing the authentication
 */
export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    // Create a server-side Supabase client
    const supabase = await createClient();
    
    // Exchange the temporary code for a session
    // This creates and sets the auth cookies
    await supabase.auth.exchangeCodeForSession(code);
  }

  // If there's a specific redirect_to path in the URL, use that
  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // Otherwise, redirect to the default protected area
  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/protected`);
}
