/**
 * Next.js Middleware for Authentication and Session Management
 *
 * This middleware:
 * 1. Refreshes the auth session on each request
 * 2. Protects routes that require authentication
 * 3. Implements role-based access control for protected areas
 *
 * Updated for Next.js 15 with proper async API handling.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/utils/supabase/middleware";
import { SupabaseClient } from "@supabase/supabase-js";

// Helper functions for cleaner code
async function isAuthenticated(supabase: SupabaseClient) {
   const {
      data: { user },
   } = await supabase.auth.getUser();
   return !!user;
}

async function getUserRole(supabase: SupabaseClient) {
   const {
      data: { user },
   } = await supabase.auth.getUser();
   return user?.app_metadata?.app_role || "USER";
}

export async function middleware(request: NextRequest) {
   const { pathname } = request.nextUrl;

   // Create a Supabase client specifically for the middleware
   const { supabase, response } = await createMiddlewareClient(request);

   // Refresh the session using getUser() which properly validates the token
   await supabase.auth.getUser();

   // Define public paths that don't require authentication
   const isPublicPath =
      pathname === "/" ||
      pathname.startsWith("/sign-in") ||
      pathname.startsWith("/sign-up") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/products") ||
      pathname.startsWith("/public") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon.ico");

   // If the path is public, allow access regardless of authentication
   if (isPublicPath) {
      return response;
   }

   // If not authenticated, redirect to sign-in for protected routes
   if (!(await isAuthenticated(supabase))) {
      const redirectUrl = new URL("/sign-in", request.url);
      redirectUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirectUrl);
   }

   // Get user role for permission checks
   const userRole = await getUserRole(supabase);

   // For admin routes, silently redirect to user dashboard with admin tab active
   if (pathname.startsWith("/admin")) {
      const redirectUrl = new URL("/user", request.url);
      
      // Set tab=admin parameter - no error messages
      redirectUrl.searchParams.set("tab", "admin");
      
      return NextResponse.redirect(redirectUrl);
   }

   // For member routes, check if user has member role
   if (pathname.startsWith("/member")) {
      if (
         userRole !== "MEMBER" &&
         userRole !== "ADMIN" &&
         userRole !== "STAFF"
      ) {
         // If not a member, redirect to dashboard with access denied message
         const redirectUrl = new URL("/user", request.url);
         redirectUrl.searchParams.set(
            "error",
            "Access denied: Member area requires an active membership"
         );
         return NextResponse.redirect(redirectUrl);
      }
   }

   // Allow access to the requested route
   return response;
}

// Define which paths this middleware should run on
export const config = {
   matcher: [
      // Match all request paths except for _next/static, _next/image, api/auth, and public files
      "/((?!_next/static|_next/image|api/auth).*)",
   ],
};
