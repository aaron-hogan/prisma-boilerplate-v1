# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Message handling system with Sonner toast notifications
- Error boundary components for graceful error handling
- useActionState-compatible server actions for form state management
- Client-side form components with improved feedback
- Standardized action response types for consistent messaging
- Centralized notification utility in lib/notifications.ts
- Product purchase system updated with toast notifications
- Membership management updated with toast notifications
- UrlMessageHandler component for URL parameter to toast conversion
- Complete replacement of UI-embedded messages with toast notifications

### Changed
- Sign-in and sign-up forms converted to client components with toast notifications
- All server actions updated to return standardized status information
- Legacy actions maintained for backward compatibility
- ProductList component refactored with toast notifications
- Root layout updated to include Toaster component

### Added (Previous update)
- Loading indicators throughout the application using Next.js 15 loading.tsx convention
- Enhanced SubmitButton component with visual loading indicator
- Skeleton UI for structured content areas during loading

## [0.1.0] - 2025-03-25

### Added
- Centralized type definitions in types/index.ts
- Standardized form components with AuthForm and FormField
- AppError class for consistent error handling
- Shared authentication data fetching with getAuthData utility

### Changed
- Improved error handling with graceful degradation
- Consolidated duplicate utilities and filters
- Enhanced SubmitButton with better loading states
- Streamlined admin route handling with shared redirect component

### Removed
- Deprecated header-auth.tsx component
- Legacy RBAC methods
- Redundant console logging
- Duplicate helper functions

### Fixed
- Bug in hasPermission function for proper permission checks
- Standardized snake_case vs. camelCase inconsistencies in types
- Improved type safety across components