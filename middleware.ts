import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

/**
 * Next.js Middleware for Supabase Auth
 * 
 * This middleware:
 * 1. Runs on every request matching the matcher patterns below
 * 2. Calls updateSession which refreshes the auth session if needed
 * 3. Is essential for the server-side auth flow to work correctly
 * 
 * The middleware is critical because:
 * - Server Components cannot set cookies, but middleware can
 * - Auth tokens need to be refreshed before they expire
 * - Protected routes need to be checked consistently
 * 
 * @param request - The incoming Next.js request
 * @returns A response possibly modified with refreshed auth cookies
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Middleware matcher configuration
 * 
 * This tells Next.js which paths the middleware should run on.
 * We run it on all paths EXCEPT:
 * - Static files, images, and favicons (which don't need auth checks)
 * 
 * It's important to exclude static assets for performance reasons,
 * as these requests don't need auth handling and running middleware
 * on them would be wasteful.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
