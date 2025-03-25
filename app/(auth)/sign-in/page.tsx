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
import { Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { AuthForm } from "@/components/auth-form";
import { FormField } from "@/components/form-field";
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
  
  // Create subtitle with sign-up link
  const subtitle = (
    <>
      Don't have an account?{" "}
      <Link className="text-primary font-medium underline" href="/sign-up">
        Sign up
      </Link>
    </>
  );
  
  // Create custom label with forgot password link
  const passwordLabel = (
    <div className="flex justify-between items-center">
      <Label htmlFor="password">Password</Label>
      <Link className="text-xs text-primary underline" href="/forgot-password">
        Forgot Password?
      </Link>
    </div>
  );
  
  return (
    <AuthForm
      title="Sign in"
      subtitle={subtitle}
      message={searchParams}
    >
      <FormField
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
        autoComplete="email"
      />
      
      <FormField
        label={passwordLabel}
        name="password"
        type="password"
        placeholder="Your password"
        required
        autoComplete="current-password"
      />
      
      <SubmitButton 
        className="w-full" 
        pendingText="Signing In..." 
        formAction={signInAction}
        wrapperClassName="mt-2"
      >
        Sign in
      </SubmitButton>
    </AuthForm>
  );
}