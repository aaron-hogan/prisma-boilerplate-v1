/**
 * Sign-in Page Component
 * 
 * This page renders the sign-in form and processes authentication via
 * a server action. It:
 * 1. Displays email/password fields
 * 2. Submits credentials to the signInAction
 * 3. Provides links to sign-up and forgot password pages
 * 4. Handles error messages from failed sign-in attempts
 * 
 * Authentication flow:
 * - User submits email/password
 * - signInAction validates credentials with Supabase
 * - On success: redirects to /dashboard
 * - On failure: displays error message
 */
import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

/**
 * Login component for user authentication
 * 
 * @param props.searchParams - Contains error/success messages from form submission
 * @returns The sign-in form with error handling
 */
export default async function Login(props: { searchParams: Promise<Message> }) {
  // Await the search params which may contain error messages
  const searchParams = await props.searchParams;
  
  return (
    <form className="flex-1 flex flex-col min-w-64">
      <h1 className="text-2xl font-medium">Sign in</h1>
      <p className="text-sm text-foreground">
        Don't have an account?{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          Sign up
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        {/* Email field with validation */}
        <Label htmlFor="email">Email</Label>
        <Input 
          name="email" 
          placeholder="you@example.com" 
          required 
          type="email"
          autoComplete="email"
        />
        
        {/* Password field with forgot password link */}
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password"
          >
            Forgot Password?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
          autoComplete="current-password"
        />
        
        {/* Submit button that invokes the signInAction server action */}
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Sign in
        </SubmitButton>
        
        {/* Display error message if authentication fails */}
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
