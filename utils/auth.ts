// utils/auth.ts
// This file contains utilities for JWT token handling, user roles, and permission checks

import { jwtDecode } from "jwt-decode";
import { createClient } from "@/utils/supabase/server";

/**
 * JWT Payload interface representing the structure of our JWT claims
 * 
 * Our JWTs contain the following standard claims:
 * - sub: Subject (the user ID)
 * - iat: Issued at time
 * - exp: Expiration time
 * - aud: Audience
 * 
 * Custom claims include:
 * - app_role: The user's role in the application (USER, ADMIN, STAFF, MEMBER)
 *   This claim is added by our custom_access_token_hook in the database
 */
interface JwtPayload {
  app_role?: string;     // User role, set by Postgres function on token creation/refresh
  sub?: string;          // Subject (user ID)
  iat?: number;          // Issued at (timestamp)
  exp?: number;          // Expiration time (timestamp)
  [key: string]: any;    // For any additional claims
}

/**
 * Gets JWT claims from the current user session
 * 
 * This function:
 * 1. Creates a Supabase client with server-side auth context
 * 2. First validates the user exists with getUser() as primary auth check
 * 3. Then retrieves the current session to access JWT claims
 * 4. Safely decodes the JWT access token
 * 
 * @returns The decoded JWT claims or null if no session/token or decoding fails
 * 
 * Security notes:
 * - Server-side function only; don't expose JWT claims directly to the client
 * - Used for role-based access control via the app_role claim
 * - JWT validation is handled by Supabase auth, this only decodes the payload
 * - Following Supabase best practices by using getUser() first
 */
export async function getJwtClaims() {
  const supabase = await createClient();
  
  // First verify user exists with getUser() for primary authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Now we can safely get session for JWT claims
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) return null;
  
  try {
    return jwtDecode<JwtPayload>(session.access_token);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

/**
 * Checks if the current user has one of the allowed roles
 * 
 * @param allowedRoles - Array of role strings that are authorized
 * @returns Boolean indicating whether the user has an allowed role
 * 
 * Note: Defaults to 'USER' role when no role claim is present in the JWT
 */
export async function hasRole(allowedRoles: string[]) {
  const claims = await getJwtClaims();
  const userRole = claims?.app_role || 'USER';
  
  return allowedRoles.includes(userRole);
}

/**
 * Role-Based Access Control (RBAC) permission checks
 * 
 * These functions implement specific permission checks based on user roles.
 * Use these functions in route handlers, server actions, and middleware
 * to enforce access control.
 * 
 * Security note: Always perform permission checks on the server side.
 */

/**
 * Checks if current user can delete apples
 * @returns Boolean - true if user has ADMIN role
 */
export async function canDeleteApples() {
  const claims = await getJwtClaims();
  return claims?.app_role === 'ADMIN';
}

/**
 * Checks if current user can delete oranges
 * @returns Boolean - true if user has ADMIN or STAFF role
 */
export async function canDeleteOranges() {
  const claims = await getJwtClaims();
  return ['ADMIN', 'STAFF'].includes(claims?.app_role || '');
}

/**
 * Checks if current user can create products
 * @returns Boolean - true if user has ADMIN or STAFF role
 */
export async function canCreateProducts() {
  const claims = await getJwtClaims();
  return ['ADMIN', 'STAFF'].includes(claims?.app_role || '');
}

/**
 * Checks if current user can access the member area
 * @returns Boolean - true if user has ADMIN, STAFF, or MEMBER role
 */
export async function canAccessMemberArea() {
  const claims = await getJwtClaims();
  return ['ADMIN', 'STAFF', 'MEMBER'].includes(claims?.app_role || '');
}

/**
 * Checks if current user can access the admin area
 * @returns Boolean - true if user has ADMIN or STAFF role
 */
export async function canAccessAdminArea() {
  const claims = await getJwtClaims();
  return ['ADMIN', 'STAFF'].includes(claims?.app_role || '');
}