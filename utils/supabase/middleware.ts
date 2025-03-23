import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Updates the Supabase auth session during a request-response cycle.
 * 
 * This critical function is called by the middleware for every request and:
 * 1. Creates a Supabase server client with special cookie handling for the middleware
 * 2. Refreshes the auth token if it's expired (via getUser())
 * 3. Passes the refreshed tokens to both the server and client sides
 * 4. Handles route protection for authenticated routes
 * 
 * The middleware is the perfect place to refresh tokens because:
 * - It runs on every request before reaching the application code
 * - It can both read cookies from the request and set cookies on the response
 * - It can redirect unauthenticated users trying to access protected routes
 * 
 * @param request - The incoming Next.js request
 * @returns A response object with refreshed auth tokens in cookies
 */
export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response that we'll enhance with cookies
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Create a Supabase client specifically configured for middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // Get cookies from the request
          getAll() {
            return request.cookies.getAll();
          },
          // Set cookies on both the request and response
          setAll(cookiesToSet) {
            // First, set cookies on the request object
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            // Create a new response with the updated request
            response = NextResponse.next({
              request,
            });
            // Then set the same cookies on the response for the browser
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // This will refresh the session if expired - critically important for Server Components
    // Always use getUser() for auth checks as it verifies with the Supabase Auth server
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();

    // Protect routes that require authentication by redirecting to sign-in
    if (request.nextUrl.pathname.startsWith("/protected") && user.error) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    
    // Optional: redirect from home to protected area when user is logged in
    // if (request.nextUrl.pathname === "/" && !user.error) {
    //   return NextResponse.redirect(new URL("/protected", request.url));
    // }

    // Return the response with refreshed auth cookies
    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
