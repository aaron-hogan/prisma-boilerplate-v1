# Codebase Cleanup and Enhancement Todo List

## Completed Work

### Auth System Improvements
- [x] Consolidated JWT-based role checking and removed redundant database role checks
- [x] Cleaned up and standardized permission checking functions
- [x] Removed legacy RBAC methods in favor of unified approach
- [x] Fixed a bug in hasPermission function to properly check against PERMISSIONS map

### Component Cleanup
- [x] Removed deprecated `header-auth.tsx` component
- [x] Created consistent auth-form patterns with reusable components
- [x] Simplified navigation components with shared auth data fetching
- [x] Enhanced SubmitButton with better loading state handling

### Utilities Consolidation
- [x] Merged active filters from `filters.ts` and `soft-delete.ts`
- [x] Created shared getAuthData utility for auth data fetching
- [x] Standardized error handling with AppError class
- [x] Enhanced form field components for better reusability

### Admin/User Separation
- [x] Maintained clean separation between user and admin UX
- [x] Consolidated redundant admin route components with shared redirect component

### Type System Standardization
- [x] Created central types directory with shared definitions
- [x] Moved common interfaces and enums to shared location
- [x] Set up backward compatibility with existing type imports
- [x] Created comprehensive type definitions for products, users, and permissions

### Code Quality
- [x] Removed unnecessary console logs while keeping essential comments
- [x] Improved error handling patterns with silent failures where appropriate
- [x] Updated components to handle errors more gracefully

## Current Work: Message Handling System

### Notification System Implementation (In Progress)
- [x] Install Sonner toast notification library
- [x] Create centralized notification utility in lib/notifications.ts
- [x] Add Toaster component to root layout.tsx
- [x] Create standardized action response types for consistent status information
- [x] Create updated signUpWithState action that supports useActionState hook
- [x] Create signInWithState action for standardized sign-in feedback
- [x] Update more server actions to return standardized status information
  - [x] Add purchaseProductWithState with useActionState support
  - [x] Add revokeMembershipWithState with useActionState support
- [x] Implement useActionState hook in client components for displaying notifications
  - [x] Update ProductList component to use toast notifications
  - [x] Create SignUpForm and SignInForm components with toast notifications
- [x] Add error boundary components for handling unexpected errors
- [✓] Test notification system with all updated components (in progress)

## Future Enhancements to Consider
- Further standardization of component styling with shadcn/ui
- More consistent type usage across all components
- Additional unit tests for critical functionality
- Improve form validation with Zod or similar library