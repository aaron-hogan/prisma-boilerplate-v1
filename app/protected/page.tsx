import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/utils/profile";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";

/**
 * Protected Page Component
 * 
 * This Server Component:
 * 1. Creates a server-side Supabase client
 * 2. Securely verifies if the user is authenticated using getUser()
 * 3. Redirects unauthenticated users to the sign-in page
 * 4. For authenticated users, displays their user details
 * 
 * Key security points:
 * - Server Components provide true server-side authentication checks
 * - getUser() makes an Auth API call to validate the session token
 * - This is more secure than checking cookie values directly
 * - Protected routes can be secured via both the middleware and page components
 * 
 * @returns A React component showing protected content or a redirect
 */
export default async function ProtectedPage() {
  // Create a server-side Supabase client
  const supabase = await createClient();

  // Get the current user - this validates the session with Supabase Auth
  // IMPORTANT: For security reasons, always use getUser() not getSession()
  // in server components to check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is not authenticated, redirect to sign-in page
  if (!user) {
    return redirect("/sign-in");
  }

  // Ensure the user has a profile
  const profile = await ensureUserProfile(user);

  // Display protected content to authenticated users
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user with role: {profile?.appRole}
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
        <h2 className="font-bold text-2xl mb-4">Your profile details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>
    </div>
  );
}
