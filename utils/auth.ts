// utils/auth.ts
// This file contains utilities for JWT token handling, user roles, and permission checks

import { jwtDecode } from "jwt-decode";
import { createClient } from "@/utils/supabase/server";
import { JwtPayload, AppRole, PermissionResult } from "@/utils/auth.types";

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
 * These functions implement permission checks based on user roles.
 * Use these functions in route handlers, server actions, and middleware
 * to enforce access control.
 * 
 * Security note: Always perform permission checks on the server side.
 */

/**
 * Permission definitions mapping for role-based access
 * Each permission specifies which roles are allowed to access it
 */
const PERMISSIONS = {
  // Access areas
  'access:admin': ['ADMIN', 'STAFF'],
  'access:member': ['ADMIN', 'STAFF', 'MEMBER'],
  
  // Products
  'products:create': ['ADMIN', 'STAFF'],
  'products:delete': ['ADMIN'],
  'products:delete:own': ['ADMIN', 'STAFF'], // Staff can delete their own products
  
  // Specific product types
  'apples:delete': ['ADMIN'],
  'oranges:delete': ['ADMIN', 'STAFF'],
  
  // Memberships
  'memberships:manage': ['ADMIN'],
  'memberships:cancel:own': ['ADMIN', 'STAFF', 'MEMBER'], // Users can cancel their own memberships
  
  // Purchases
  'purchases:cancel:own': ['ADMIN', 'STAFF', 'MEMBER', 'USER'], // Users can cancel their own purchases
  'purchases:cancel:any': ['ADMIN'], // Admins can cancel any purchase
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Unified permission checking function
 * 
 * @param permission - The permission to check
 * @param ownerId - Optional owner ID for checking ownership-based permissions
 * @param resourceOwnerId - Optional resource owner ID for comparing with the user
 * @returns Object with allowed status and optional reason
 */
export async function hasPermission(
  permission: Permission,
  ownerId?: string,
  resourceOwnerId?: string
): Promise<PermissionResult> {
  // Get user claims
  const claims = await getJwtClaims();
  if (!claims) {
    return { allowed: false, reason: 'Not authenticated' };
  }
  
  const userRole = claims.app_role || 'USER';
  
  // Check if this permission exists
  if (!PERMISSIONS[permission]) {
    return { allowed: false, reason: 'Unknown permission' };
  }
  
  // Check if user's role is in the allowed roles for this permission
  if (PERMISSIONS[permission].includes(userRole as AppRole)) {
    return { allowed: true };
  }
  
  // Special case for ownership-based permissions
  if (permission.endsWith(':own') && ownerId && resourceOwnerId) {
    if (ownerId === resourceOwnerId) {
      return { allowed: true };
    }
    return { 
      allowed: false, 
      reason: 'You can only perform this action on resources you own' 
    };
  }
  
  return { 
    allowed: false, 
    reason: 'Insufficient permissions' 
  };
}

/**
 * Legacy permission functions for backward compatibility
 * These will eventually be deprecated in favor of the unified hasPermission function
 */

/**
 * Checks if current user can delete apples
 * @returns Boolean - true if user has ADMIN role
 */
export async function canDeleteApples() {
  const result = await hasPermission('apples:delete');
  return result.allowed;
}

/**
 * Checks if current user can delete oranges
 * @returns Boolean - true if user has ADMIN or STAFF role
 */
export async function canDeleteOranges() {
  const result = await hasPermission('oranges:delete');
  return result.allowed;
}

/**
 * Checks if current user can create products
 * @returns Boolean - true if user has ADMIN or STAFF role
 */
export async function canCreateProducts() {
  const result = await hasPermission('products:create');
  return result.allowed;
}

/**
 * Checks if current user can access the member area
 * @returns Boolean - true if user has ADMIN, STAFF, or MEMBER role
 */
export async function canAccessMemberArea() {
  const result = await hasPermission('access:member');
  return result.allowed;
}

/**
 * Checks if current user can access the admin area
 * @returns Boolean - true if user has ADMIN or STAFF role
 */
export async function canAccessAdminArea() {
  const result = await hasPermission('access:admin');
  return result.allowed;
}