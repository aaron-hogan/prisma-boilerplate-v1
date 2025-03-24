/**
 * Shared authentication and authorization type definitions
 * 
 * This file provides a single source of truth for auth-related types
 * used throughout the application, ensuring consistency in how we
 * handle JWT claims, roles, and permissions.
 */

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
export interface JwtPayload {
  app_role?: string;     // User role, set by Postgres function on token creation/refresh
  sub?: string;          // Subject (user ID)
  iat?: number;          // Issued at (timestamp)
  exp?: number;          // Expiration time (timestamp)
  [key: string]: any;    // For any additional claims
}

/**
 * Application roles enum
 * 
 * These values must match the enum definition in the database schema
 * and what's set by our custom_access_token_hook.
 */
export type AppRole = 'USER' | 'MEMBER' | 'STAFF' | 'ADMIN';

/**
 * Permission check result type
 */
export interface PermissionResult {
  allowed: boolean;
  reason?: string;
}