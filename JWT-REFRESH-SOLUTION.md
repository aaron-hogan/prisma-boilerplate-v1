# JWT Token Refresh Solution

## Problem Summary

We encountered issues with JWT token refresh in our Next.js 15 + Supabase authentication system:

1. Member tabs disappeared after login for users with the MEMBER role
2. Role changes (via purchasing a membership) didn't always update the UI
3. Next.js 15 "sync dynamic APIs" errors appeared in logs related to cookies and searchParams

## Root Causes

1. **JWT Claim Update Issues**: When a user's role changed in the database, JWT claims weren't consistently updated.

2. **Race Conditions**: The client and server could have different views of the user's role during state transitions.

3. **Next.js 15 Async API Requirements**: The upgrade to Next.js 15 required proper async handling of cookies and searchParams.

## Solution Implemented

### 1. Proper Async Handling for Next.js 15

All Next.js 15 dynamic APIs (cookies(), headers(), searchParams) must be awaited before use:

```typescript
// In server.ts, simplified-server.ts, middleware.ts:
const cookieStore = await cookies();

// In cookie handlers:
async get(name) {
  const cookie = await cookieStore.get(name);
  return cookie?.value;
}

// In middleware:
const { supabase, response } = await createMiddlewareClient(request);
```

### 2. Dedicated Token Refresh API

Created a reliable token refresh API endpoint:

```typescript
// In /api/auth/refresh/route.ts
export async function POST(request: NextRequest) {
  try {
    // Get the Supabase client
    const supabase = await createClient();
    
    // Get the current user (this will also refresh the session)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Explicitly refresh the session to update JWT claims
    const { error: refreshError } = await supabase.auth.refreshSession();
    
    // Verify JWT claims match database role (sanity check)
    // If there's a mismatch, update JWT claims to match database
    // and refresh again
    
    return NextResponse.json({
      success: true,
      message: 'Session refreshed successfully',
      role: profile.appRole
    });
  } catch (error) {
    // Error handling
  }
}
```

### 3. Clean User Data API

Created a dedicated user data API to provide fresh data to client components:

```typescript
// In /api/user-data/route.ts
export async function GET() {
  const supabase = await createClient();
  
  // Verify authentication
  const { data: { user }, error } = await supabase.auth.getUser();
  
  // Get profile with membership
  const profile = await prisma.profile.findUnique({
    where: { authUserId: user.id },
    include: { membership: true }
  });
  
  // Get purchases with products
  const purchases = await prisma.$queryRaw`...`;
  
  // Return user data in a consistent format
  return NextResponse.json({
    user: { ... },
    profile: { ... },
    purchases: [ ... ]
  });
}
```

### 4. Improved Purchase Flow

After role changes, we now explicitly refresh tokens:

```typescript
// In actions.ts - purchaseProductAction
// After updating role to MEMBER and refreshing session
await supabase.auth.refreshSession();

// Additionally call dedicated refresh endpoint for reliability
await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
```

### 5. Cleaner Role-Based UI

In the user-dashboard component, we use a simple approach to check roles:

```typescript
// Simple role check
const isMember = ["MEMBER", "STAFF", "ADMIN"].includes(userData.profile.appRole);

// Conditionally show tabs based on role
{isMember && (
  <button onClick={() => setTab("member")}>
    Member Area
  </button>
)}
```

### 6. Improved Middleware with Helper Functions

Refactored middleware to use helper functions and proper async handling:

```typescript
// Helper functions
async function isAuthenticated(supabase) {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

async function getUserRole(supabase) {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.app_metadata?.app_role || 'USER';
}

// In middleware
if (!(await isAuthenticated(supabase))) {
  // Redirect to login
}

const userRole = await getUserRole(supabase);

// Role-based routing
if (pathname.startsWith('/admin') && !['ADMIN', 'STAFF'].includes(userRole)) {
  // Redirect from admin area
}
```

## Key Files Updated

1. `/utils/supabase/server.ts` - Async cookie handling
2. `/utils/supabase/simplified-server.ts` - Async cookie handling
3. `/utils/supabase/middleware.ts` - Async middleware client (replaced with simplified version)
4. `/middleware.ts` - Improved role-based routing with helper functions (replaced with simplified version)
5. `/app/api/user-data/route.ts` - Fresh user data API
6. `/app/api/auth/refresh/route.ts` - Token refresh API
7. `/app/api/memberships/[profileId]/route.ts` - Updated membership API
8. `/app/actions.ts` - Better purchase flow with token refresh
9. `/components/user-dashboard.tsx` - Cleaner role-based UI

## Results

1. Member tabs now correctly appear and remain visible for users with membership
2. Role changes (after purchasing membership) are consistently reflected in the UI
3. Next.js 15 "sync dynamic APIs" errors are resolved
4. The application maintains proper state across page reloads
5. Authentication flow is more reliable with explicit token refresh

## Key Lessons

1. Always await Next.js 15 dynamic APIs before use
2. Implement helper functions for cleaner, more maintainable code
3. Use dedicated APIs for critical operations like token refresh
4. Verify state changes with database checks before proceeding
5. Keep UI logic simple with direct role checks