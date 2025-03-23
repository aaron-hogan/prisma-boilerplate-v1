import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

/**
 * Auth Header Component
 * 
 * This Server Component:
 * 1. Creates a server-side Supabase client
 * 2. Checks if the user is authenticated using getUser()
 * 3. Renders either:
 *    - A greeting and sign-out button for authenticated users
 *    - Sign-in and sign-up buttons for unauthenticated users
 * 
 * Key points:
 * - This is a Server Component, so it can directly access the auth state on the server
 * - Using getUser() to get the current user is safe and secure
 * - The sign-out form uses the signOutAction Server Action
 * 
 * @returns A React component showing auth state and actions
 */
export default async function AuthButton() {
  // Create a server-side Supabase client
  const supabase = await createClient();

  // Get the current user - this is secure because it runs on the server
  // and validates the session with Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  // Conditional rendering based on auth state
  return user ? (
    // For authenticated users: show greeting and sign-out button
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    // For unauthenticated users: show sign-in and sign-up buttons
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
