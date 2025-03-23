// app/auth/callback/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ensureUserProfile } from "@/utils/profile";

export async function GET(request: Request) {
  console.log("Auth callback route triggered");
  
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    // Create a server-side Supabase client
    const supabase = await createClient();
    
    // Exchange the temporary code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Error exchanging code for session:", error);
    } else if (data?.user) {
      // Now that the user is authenticated, ensure they have a profile
      console.log("User authenticated, ensuring profile exists");
      await ensureUserProfile(data.user);
    } else {
      console.log("No user data returned from exchange code");
    }
  } else {
    console.log("No auth code provided to callback route");
  }

  // If there's a specific redirect_to path in the URL, use that
  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // Otherwise, redirect to the default protected area
  return NextResponse.redirect(`${origin}/dashboard`);
}