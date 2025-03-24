# RBAC/RLS/CRUD Cleanup Plan

This document outlines the necessary cleanup tasks for our codebase after implementing RBAC, RLS, and CRUD functionality. Tasks are organized by priority to deliver the highest value improvements first.

## Immediate High-Value Improvements

### 1. Remove Obsolete Debug Endpoints
- [x] Remove `/app/api/prisma-fix/route.ts` (debug endpoint for database schema testing)
- [x] Remove `/app/api/prisma-fix-2/route.ts` (debug endpoint for purchase cancellations)

### 2. Consolidate Authentication & Authorization
- [x] Create a central `auth.types.ts` file with shared JWT interfaces
- [x] Remove duplicate `JwtPayload` interfaces from:
  - [x] `/app/actions.ts` (lines 33-36)
  - [x] `/utils/auth.ts` (lines 20-26)
  - [x] `/utils/supabase/middleware.ts` (lines 11-14)
- [x] Implement a unified permission system with a single `hasPermission(permissionName)` function
- [ ] Resolve redundancy between middleware and layout component auth checks

### 3. Eliminate Duplicate Code & Functionality
- [x] Remove unused `cancelPurchase` function in user-dashboard.tsx (lines 124-163)
- [x] Fix `cancelMembership` function call (line 322) - missing parameter
- [ ] Standardize JWT claim updates across the codebase
- [ ] Choose between `supabase.auth.updateUser()` and `supabase.auth.admin.updateUserById()`

### 4. Address Security Issues
- [x] Move direct JWT decoding in client component (`user-dashboard.tsx` lines 100-116) to server actions
- [ ] Fix raw SQL injection risk by using parameterized queries
- [ ] Implement proper session invalidation when user roles change

## Medium Priority Improvements

### 1. Standardize Error Handling
- [ ] Create consistent error handling patterns across server actions and API routes
- [ ] Implement standardized API response format with `{ success, data, error }`
- [ ] Add proper error logging and monitoring

### 2. Refactor Large Server Actions
- [ ] Break down complex server actions like `purchaseProductAction` into smaller functions
- [ ] Extract business logic from server actions into separate service functions
- [ ] Improve server action validation with Zod or similar library

### 3. Optimize Database Queries
- [ ] Use Prisma's `include` to fetch related data in single queries
- [ ] Reduce sequential database calls in user-facing pages
- [ ] Ensure proper indexes are created for frequently queried fields

### 4. Standardize API Route Protection
- [ ] Refactor API routes to use centralized RBAC functions from `/utils/auth.ts`
- [ ] Create a withAuth HOC for API routes to standardize authorization checks
- [ ] Apply consistent status codes and error messages across all API responses

## Low Priority Improvements

### 1. Improve Code Organization
- [ ] Standardize naming conventions (prefer camelCase)
- [ ] Update outdated comments and documentation
- [ ] Create a centralized data access layer

### 2. Enhance TypeScript Usage
- [ ] Enable stricter TypeScript checks
- [ ] Add explicit types to all state variables and function parameters
- [ ] Add better type definitions for API responses

### 3. Performance & Testing
- [ ] Optimize middleware with appropriate matchers
- [ ] Add tests for RLS policies and different user roles
- [ ] Implement token validation beyond simple decoding

## Implementation Plan

### Phase 1: Critical Cleanup (Days 1-2)
1. Remove debug endpoints and duplicate code
2. Consolidate JWT handling and interfaces
3. Address the most critical security issues

### Phase 2: Standardization (Days 3-5)
1. Implement unified permission system
2. Standardize error handling
3. Refactor large server actions
4. Optimize critical database queries

### Phase 3: Enhancements (Days 6-10)
1. Complete API route standardization
2. Improve TypeScript usage
3. Enhance code organization
4. Add testing and documentation

## Key Principles
- Focus on security and maintainability first
- Apply the 80/20 principle - prioritize changes with the highest impact
- Ensure changes are backward compatible
- Document architectural decisions