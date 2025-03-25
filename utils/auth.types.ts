/**
 * Shared authentication and authorization type definitions
 * 
 * This file re-exports auth types from the central types directory
 * for backward compatibility.
 * 
 * For new code, import directly from "@/types" instead.
 */

import { JwtPayload, PermissionResult, AppRole } from "@/types";

// Re-export for backward compatibility
export type { JwtPayload, PermissionResult, AppRole };