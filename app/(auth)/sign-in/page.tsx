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
 * - On success: redirects to /user
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
    <form className="w-full flex flex-col p-4 border rounded-lg shadow-sm">
      <h1 className="text-2xl font-medium mb-2">Sign in</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Don't have an account?{" "}
        <Link className="text-primary font-medium underline" href="/sign-up">
          Sign up
        </Link>
      </p>
      <div className="flex flex-col gap-4">
        {/* Email field with validation */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            name="email" 
            placeholder="you@example.com" 
            required 
            type="email"
            autoComplete="email"
          />
        </div>
        
        {/* Password field with forgot password link */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              className="text-xs text-primary underline"
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
        </div>
        
        <div className="mt-2">
          {/* Submit button that invokes the signInAction server action */}
          <SubmitButton 
            className="w-full" 
            pendingText="Signing In..." 
            formAction={signInAction}
          >
            Sign in
          </SubmitButton>
        </div>
        
        {/* Display error message if authentication fails */}
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
