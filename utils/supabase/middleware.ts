// utils/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

/**
 * Interface for JWT token payload with role-based access control
 * - app_role: The user's role within the application (ADMIN, STAFF, MEMBER, USER)
 * - Additional JWT claims can be accessed via index signature
 */
interface JwtPayload {
  app_role?: string;
  [key: string]: any;
}

/**
 * Middleware that handles Supabase authentication and enforces role-based access control.
 * This function:
 * 1. Creates a Supabase client with cookie handling for auth persistence
 * 2. Refreshes the user session
 * 3. Implements role-based redirects for authenticated users
 * 4. Protects routes based on user roles from JWT claims
 * 5. Handles specific permission requirements for admin sections
 */
export const updateSession = async (request: NextRequest) => {
   try {
      // Create a response that we'll enhance with cookies
      let response = NextResponse.next({
         request: {
            headers: request.headers,
         },
      });

      // Create a Supabase client specifically for middleware operations
      // This enables auth cookie handling between client and server
      const supabase = createServerClient(
         process.env.NEXT_PUBLIC_SUPABASE_URL!,
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
         {
            cookies: {
               // Read all cookies from the incoming request
               getAll() {
                  return request.cookies.getAll();
               },
               // Set cookies on both the request (for middleware chain) and response (for browser)
               setAll(cookiesToSet) {
                  // First update request cookies for any downstream middleware
                  cookiesToSet.forEach(({ name, value }) =>
                     request.cookies.set(name, value)
                  );
                  // Create a new response object with updated request
                  response = NextResponse.next({ request });
                  // Set cookies on the response to be sent back to the browser
                  cookiesToSet.forEach(({ name, value, options }) =>
                     response.cookies.set(name, value, options)
                  );
               },
            },
         }
      );

      // Primary authentication using getUser() as recommended by Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get the pathname
      const pathname = request.nextUrl.pathname;
      
      // Smart Homepage Routing: Redirect authenticated users from root page to their role-appropriate dashboard
      if (pathname === "/" && user) {
         // For role-based access, we still need to get the JWT token to access app_role
         // This is safe because we've already verified the user exists via getUser()
         const { data: { session } } = await supabase.auth.getSession();
         
         if (session?.access_token) {
            try {
               // Extract the user's role from JWT claims in the access token
               const decoded = jwtDecode<JwtPayload>(session.access_token);
               // Default to 'USER' role if no app_role claim exists
               const userRole = decoded.app_role || 'USER';
               
               // Role-based routing for authenticated users:
               // - ADMIN/STAFF -> Admin dashboard
               // - MEMBER -> Member dashboard
               // - All others -> General user dashboard
               if (['ADMIN', 'STAFF'].includes(userRole)) {
                  return NextResponse.redirect(new URL('/admin', request.url));
               } else if (userRole === 'MEMBER') {
                  return NextResponse.redirect(new URL('/member', request.url));
               } else {
                  return NextResponse.redirect(new URL('/user', request.url));
               }
            } catch (error) {
               console.error('Error decoding JWT in middleware:', error);
               // Continue to default response if JWT decoding fails
            }
         }
      }
      
      // Authentication Guard: Protect private routes from unauthenticated access
      if (!user) {
         // List of paths that require authentication
         if (
            pathname.startsWith('/admin') || // Admin routes 
            pathname.startsWith('/member') || // Member routes
            pathname === '/user' || // User dashboard
            pathname === '/purchases' // Purchase history
         ) {
            // Redirect unauthenticated users to sign-in page
            // while preserving the original URL as the return path
            return NextResponse.redirect(new URL('/sign-in', request.url));
         }
         
         // For public routes, proceed normally for unauthenticated users
         return response;
      }
      
      // Role-Based Access Control (RBAC): Enforce permission boundaries for authenticated users
      // We've already verified user is authenticated via getUser()
      // Now safely access the JWT claims for role-based routing
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
         try {
            // Decode JWT access token to extract role information from custom claims
            const decoded = jwtDecode<JwtPayload>(session.access_token);
            // Default to basic 'USER' role if app_role claim is missing
            const userRole = decoded.app_role || 'USER';
            
            // Admin section authorization
            if (pathname.startsWith('/admin') && !['ADMIN', 'STAFF'].includes(userRole)) {
               // Graceful redirection based on user's actual role
               if (userRole === 'MEMBER') {
                  return NextResponse.redirect(new URL('/member', request.url));
               } else {
                  return NextResponse.redirect(new URL('/user', request.url));
               }
            }
            
            // Member section authorization
            if (pathname.startsWith('/member') && !['ADMIN', 'STAFF', 'MEMBER'].includes(userRole)) {
               // If user isn't a member or higher role, redirect to standard dashboard
               return NextResponse.redirect(new URL('/user', request.url));
            }
            
            // No special route restriction for apples management - both ADMIN and STAFF can access
            // The RLS policies will prevent STAFF from deleting apples at the database level
            
         } catch (error) {
            console.error('Error decoding JWT in middleware:', error);
            // On JWT error, redirect to login - fail closed for security
            return NextResponse.redirect(new URL('/sign-in', request.url));
         }
      }

      return response;
   } catch (e) {
      // Global error handler for middleware
      console.error('Error in middleware:', e);
      
      // Fallback response that maintains the request headers
      // This allows the application to continue working even if 
      // the authentication/authorization layer encounters an error
      return NextResponse.next({
         request: {
            headers: request.headers,
         },
      });
   }
};