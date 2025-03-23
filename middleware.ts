// middleware.ts
/**
 * Next.js middleware for authentication and session management
 * 
 * This middleware runs on every applicable request to:
 * 1. Validate the user's session with Supabase Auth
 * 2. Refresh tokens if needed
 * 3. Update session cookies
 * 
 * Future enhancements will include:
 * - RBAC (Role-Based Access Control) implementation
 * - Route-specific access control rules
 * - Audit logging for security events
 */
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

/**
 * Main middleware function that processes each request
 * 
 * Currently, this middleware only handles authentication session updates.
 * It calls the updateSession helper from Supabase which:
 * - Refreshes the access token if it's expired
 * - Updates the auth cookie with the new token
 * - Adds the user context to the request
 * 
 * @param request - The incoming request object
 * @returns NextResponse with updated auth cookies as needed
 */
export async function middleware(request: NextRequest) {
  // Currently just handling auth session refresh, RBAC implementation coming soon
  return await updateSession(request);
}

/**
 * Middleware configuration that defines which routes the middleware applies to
 * 
 * The matcher uses a regex pattern to:
 * - Apply middleware to all routes (/)
 * - Exclude Next.js internal routes (_next/*)
 * - Exclude static assets and images
 * 
 * Security note: This pattern ensures all application routes are protected,
 * while optimizing performance by excluding static content that doesn't
 * need authentication checks.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};