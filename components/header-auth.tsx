import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

/**
 * Auth Header Component - LEGACY VERSION
 * 
 * This component has been replaced by the UserMenu component.
 * It is kept for backward compatibility but redirects users to the new component.
 * 
 * @deprecated Use UserMenu instead
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
