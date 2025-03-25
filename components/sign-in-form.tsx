'use client'

import { signInWithState } from "@/app/actions";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { AuthForm } from "@/components/auth-form";
import { FormField } from "@/components/form-field";
import Link from "next/link";
import { useEffect } from "react";
import { notify } from "@/lib/notifications";
import { FormActionState } from "@/types/action-responses";
import { useRouter } from "next/navigation";

// Initial state for the form
const initialState: FormActionState = {
  status: 'info',
  message: ''
};

/**
 * Client-side Sign In Form with useActionState and toast notifications
 * 
 * This component:
 * 1. Uses useActionState to manage form submission state
 * 2. Shows toast notifications for success/error messages
 * 3. Handles redirection after successful sign-in
 * 4. Displays field-specific validation errors
 */
export function SignInForm() {
  const router = useRouter();
  
  // Get form state using useActionState hook
  const [state, formAction] = useActionState(signInWithState, initialState);
  
  // Handle successful sign-in with redirection
  useEffect(() => {
    if (state?.status === 'success' && state.data?.redirectPath) {
      // Show success notification
      notify.success(state.message);
      
      // Redirect to the specified path
      router.push(state.data.redirectPath);
    } else if (state?.status && state.message && state.status !== 'success') {
      // Show notifications for non-success states
      notify[state.status](state.message);
    }
  }, [state, router]);
  
  // Create subtitle with sign-up link
  const subtitle = (
    <>
      Don't have an account?{" "}
      <Link className="text-primary font-medium underline" href="/sign-up">
        Sign up
      </Link>
    </>
  );

  return (
    <AuthForm
      title="Sign in"
      subtitle={subtitle}
    >
      <FormField
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
        error={state?.fieldErrors?.email}
      />
      
      <FormField
        label="Password"
        name="password"
        type="password"
        placeholder="Your password"
        required
        error={state?.fieldErrors?.password}
      />
      
      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Forgot password?
        </Link>
      </div>
      
      <div className="mt-2">
        <SubmitButton 
          className="w-full"
          formAction={formAction}
          pendingText="Signing in..."
        >
          Sign in
        </SubmitButton>
      </div>
    </AuthForm>
  );
}