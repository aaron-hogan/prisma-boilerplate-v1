'use client'

import { signUpWithState } from "@/app/actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { SubmitButton } from "@/components/submit-button";
import { AuthForm } from "@/components/auth-form";
import { FormField } from "@/components/form-field";
import Link from "next/link";
import { useEffect } from "react";
import { notify } from "@/lib/notifications";
import { FormActionState } from "@/types/action-responses";

// Initial state for the form
const initialState: FormActionState = {
  status: 'info',
  message: ''
};

/**
 * Client-side Sign Up Form with useActionState and toast notifications
 * 
 * This component:
 * 1. Uses useActionState to manage form submission state
 * 2. Shows toast notifications for success/error messages
 * 3. Displays field-specific validation errors
 */
export function SignUpForm() {
  // Get form state using useActionState hook
  const [state, formAction] = useActionState(signUpWithState, initialState);
  
  // Display toast notification when state changes and there's a message
  useEffect(() => {
    if (state?.status && state.message) {
      notify[state.status](state.message);
    }
  }, [state]);
  
  // Create subtitle with sign-in link
  const subtitle = (
    <>
      Already have an account?{" "}
      <Link className="text-primary font-medium underline" href="/sign-in">
        Sign in
      </Link>
    </>
  );

  return (
    <AuthForm
      title="Sign up"
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
        minLength={6}
        required
        error={state?.fieldErrors?.password}
      />
      
      <div className="mt-2">
        <SubmitButton 
          className="w-full"
          formAction={formAction}
          pendingText="Signing up..."
        >
          Sign up
        </SubmitButton>
      </div>
      
      {/* Show any validation errors not tied to a specific field */}
      {state?.validationErrors && state.validationErrors.length > 0 && (
        <div className="mt-2 text-sm text-destructive">
          <ul className="list-disc list-inside">
            {state.validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </AuthForm>
  );
}