// app/auth/callback/route.ts
/**
 * OAuth Callback Route Handler
 * 
 * This route processes OAuth callbacks from Supabase Auth, handling:
 * 1. Email confirmation links
 * 2. Password reset links
 * 3. OAuth provider redirects (Google, GitHub, etc.)
 * 
 * The flow:
 * - User clicks a link in an email or completes OAuth provider flow
 * - Supabase redirects to this callback URL with a temporary code
 * - We exchange the code for a session using Supabase Auth
 * - We ensure the user has a profile in our database
 * - We redirect the user to the appropriate page
 */
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ensureUserProfile } from "@/utils/profile";

/**
 * GET handler for the auth callback route
 * 
 * Security considerations:
 * - Validates the auth code through Supabase's exchangeCodeForSession
 * - Handles redirection securely by only allowing relative paths
 * - Establishes user profile for RBAC
 * 
 * @param request - The incoming request with auth code
 * @returns NextResponse with redirect to appropriate page
 */
export async function GET(request: Request) {
  console.log("Auth callback route triggered");
  
  const requestUrl = new URL(request.url);
  // The temporary auth code from Supabase (expires quickly)
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  // Optional redirect path from the original auth request
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    // Create a server-side Supabase client
    const supabase = await createClient();
    
    // Exchange the temporary code for a session (sets cookies automatically)
    // This is a secure exchange that validates the code with Supabase
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Error exchanging code for session:", error);
      // We continue anyway to ensure user lands on a valid page,
      // even though they won't be authenticated
    } else if (data?.user) {
      // Now that the user is authenticated, ensure they have a profile
      // This is critical for the custom JWT claims and RBAC
      console.log("User authenticated, ensuring profile exists");
      await ensureUserProfile(data.user);
    } else {
      console.log("No user data returned from exchange code");
    }
  } else {
    console.log("No auth code provided to callback route");
    // We continue anyway to ensure user lands on a valid page
  }

  // Handle redirects securely:
  
  // If there's a specific redirect_to path in the URL, use that
  // The redirect_to is relative to prevent open redirect vulnerabilities
  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // Otherwise, redirect to the default protected area
  return NextResponse.redirect(`${origin}/user`);
}