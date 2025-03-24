/**
 * Next.js Middleware for Authentication and Session Management
 * 
 * This middleware:
 * 1. Refreshes the auth session on each request
 * 2. Protects routes that require authentication
 * 3. Implements role-based access control for protected areas
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Create a Supabase client specifically for the middleware
  const { supabase, response } = createMiddlewareClient(request);
  
  // Refresh the session to check if the user is authenticated
  // This updates cookies and ensures valid session state
  const { data: { session } } = await supabase.auth.getSession();
  
  // Define public paths that don't require authentication
  const isPublicPath = 
    pathname === '/' || 
    pathname.startsWith('/sign-in') || 
    pathname.startsWith('/sign-up') || 
    pathname.startsWith('/forgot-password') || 
    pathname.startsWith('/reset-password') || 
    pathname.startsWith('/products') || 
    pathname.startsWith('/public') || 
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon.ico');
  
  // If the path is public, allow access regardless of authentication
  if (isPublicPath) {
    return response;
  }
  
  // If no session exists, redirect to sign-in for protected routes
  if (!session) {
    const redirectUrl = new URL('/sign-in', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // For admin routes, check if user has admin role
  if (pathname.startsWith('/admin')) {
    // Extract user role from JWT claims
    const userRole = session.user.app_metadata.app_role;
    
    if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
      // If not admin/staff, redirect to dashboard with access denied message
      const redirectUrl = new URL('/user', request.url);
      redirectUrl.searchParams.set('error', 'Access denied: Admin area requires elevated permissions');
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // For member routes, check if user has member role
  if (pathname.startsWith('/member')) {
    // Extract user role from JWT claims
    const userRole = session.user.app_metadata.app_role;
    
    if (userRole !== 'MEMBER' && userRole !== 'ADMIN' && userRole !== 'STAFF') {
      // If not a member, redirect to dashboard with access denied message
      const redirectUrl = new URL('/user', request.url);
      redirectUrl.searchParams.set('error', 'Access denied: Member area requires an active membership');
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
    '/((?!_next/static|_next/image|api/auth).*)',
  ],
};