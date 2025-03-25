# Metrognome PMS - Product Management System

A clean, minimal product management system built with Next.js 15 and Supabase.

## Features

- **Next.js 15 App Router**: Modern Next.js structure with App Router
- **Server-Side Supabase Auth**: Complete implementation of Supabase auth using server components and middleware
- **Authentication Flows**: Sign-up, sign-in, forgot password, and password reset
- **Protected Routes**: Route protection with role-based access control
- **Type Safety**: Comprehensive TypeScript throughout
- **UI Components**: Minimalist UI components based on shadcn/ui
- **Loading States**: Built-in loading indicators following Next.js conventions
- **Prisma Integration**: Type-safe database access with Prisma

## Getting Started

1. Clone this repository
2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env.local` file with:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Database URLs
DATABASE_URL=postgresql://postgres:password@localhost:5432/your-database
DIRECT_URL=postgresql://postgres:password@localhost:5432/your-database
```

## Project Structure

- `app/` - Next.js 15 App Router pages and API routes
  - `(auth)/` - Authentication-related pages (sign-in, sign-up, etc.)
  - `admin/` - Admin-specific pages (redirects to user dashboard)
  - `api/` - API endpoints for data operations
  - `user/` - User dashboard and profile management
- `components/` - Reusable React components
  - `ui/` - Basic UI components (buttons, inputs, etc.)
- `lib/` - Shared libraries and utilities
- `prisma/` - Prisma schema and migrations
- `types/` - TypeScript type definitions
- `utils/` - Utility functions for auth, data access, etc.

## Authentication Implementation

This application includes a complete implementation of Supabase server-side authentication using Next.js App Router. The code includes detailed comments explaining:

- Server-side JWT handling
- Role-based access control
- Security best practices
- Token refresh mechanism via middleware
- Protected routes implementation

## Change Log

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes in each version.

## License

MIT