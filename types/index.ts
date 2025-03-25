/**
 * Shared Type Definitions
 * 
 * This file provides centralized type definitions used throughout the application.
 * Import these types instead of redefining them in individual components.
 */

import { User } from "@supabase/supabase-js";

// ======= Auth and User Types =======

/**
 * Application roles enum
 * Must match the enum definition in the Prisma schema
 */
export type AppRole = 'USER' | 'MEMBER' | 'STAFF' | 'ADMIN';

/**
 * Product types enum
 * Must match the enum definition in the Prisma schema
 */
export type ProductType = 'APPLE' | 'ORANGE' | 'MEMBERSHIP';

/**
 * JWT Payload interface representing the structure of JWT claims
 */
export interface JwtPayload {
  app_role?: AppRole;    // User role, set by Postgres function on token creation/refresh
  sub?: string;          // Subject (user ID)
  iat?: number;          // Issued at (timestamp)
  exp?: number;          // Expiration time (timestamp)
  [key: string]: any;    // For any additional claims
}

/**
 * Permission check result type
 */
export interface PermissionResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Unified user profile interface
 * Used for consistent representation of profile data across components
 */
export interface UserProfile {
  id: string;
  authUserId: string;
  appRole: AppRole;
  createdAt: string | Date;
  updatedAt: string | Date;
  membership?: UserMembership | null;
}

/**
 * User membership details
 */
export interface UserMembership {
  id: string;
  startDate: string | Date;
  endDate: string | Date | null;
  profileId: string;
}

/**
 * Complete user data including auth, profile, and related data
 */
export interface UserData {
  user: {
    email: string;
    id: string;
  };
  profile: {
    appRole: AppRole;
    createdAt: string;
    id: string;
    membership?: {
      startDate: string;
      endDate: string | null;
    } | null;
  };
  purchases: Purchase[];
}

// ======= Product and Purchase Types =======

/**
 * Product interface for consistent representation across components
 */
export interface Product {
  id: string;
  name: string;
  price: number | string; // Support both number and formatted string
  type: ProductType;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: string;
  deletedAt?: string | Date | null;
  
  // Related data
  creator?: {
    id: string;
    authUserId: string;
    appRole: AppRole;
  } | null;
  creatorInfo?: {
    displayName: string;
    email?: string;
    role?: string;
  };
}

/**
 * Purchase interface for consistent representation across components
 */
export interface Purchase {
  id: string;
  total: string | number;
  quantity: number;
  createdAt: string | Date;
  deletedAt?: string | Date | null;
  profileId: string;
  productId: string;
  
  // Related data
  product?: Product;
}

// ======= UI and Form Types =======

/**
 * Message type for displaying success, error, or info messages
 */
export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

/**
 * Redirect type for consistent encoding of redirects with messages
 */
export type RedirectType = "error" | "success";

/**
 * Auth data interface returned by getAuthData utility
 */
export interface AuthData {
  isAuthenticated: boolean;
  userEmail: string | null;
  userRole: AppRole;
  userId: string | null;
}