# Next.js + Supabase Boilerplate

A clean, minimal boilerplate for Next.js applications with Supabase authentication.

## Features

- **Next.js App Router**: Modern Next.js structure with App Router
- **Server-Side Supabase Auth**: Complete implementation of Supabase auth using server components and middleware
- **Authentication Flows**: Sign-up, sign-in, forgot password, and password reset
- **Protected Routes**: Example of route protection both in middleware and components
- **Type Safety**: TypeScript throughout
- **UI Components**: Basic UI components from shadcn/ui

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
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Authentication Implementation

This boilerplate includes a complete implementation of Supabase server-side authentication using Next.js App Router. The code includes detailed comments explaining:

- How the auth flow works
- Security best practices
- Token refresh mechanism via middleware
- Protected routes implementation

## License

MIT