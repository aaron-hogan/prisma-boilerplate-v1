# Codebase Cleanup Todo List

## Completed Tasks

### Auth System
- [x] Consolidate JWT-based role checking and remove redundant database role checks
- [x] Clean up and standardize permission checking functions
- [x] Remove legacy RBAC methods if any exist

### Component Cleanup
- [x] Remove deprecated `header-auth.tsx` component
- [x] Evaluate navigation components for simplification
- [x] Standardize form component patterns

### Utilities Consolidation
- [x] Merge active filters from `filters.ts` and `soft-delete.ts`
- [x] Consolidate duplicate utilities for auth data fetching
- [x] Standardize error handling patterns

### Admin/User Separation
- [x] Keep the separation between user and admin UX
- [x] Clean up redundant admin route components

## Remaining Tasks

### Role-Based Access
- [ ] Ensure consistent role-based visibility mechanisms across UI components

### Type System
- [x] Standardize shared type definitions
- [ ] Ensure consistent type usage across the codebase

### Code Cleanliness
- [ ] Remove unnecessary comments and console logs (leave essential explanatory comments)
- [ ] Ensure consistent formatting and structure