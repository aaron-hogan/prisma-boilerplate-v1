"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Server Action: Sign Up
 * 
 * This server action:
 * 1. Extracts sign-up data from the form submission
 * 2. Creates a server-side Supabase client
 * 3. Calls Supabase's signUp method with email confirmation
 * 4. Handles success/error responses with appropriate redirects
 * 
 * The flow:
 * - User submits the sign-up form with email/password
 * - Server validates the data and calls Supabase Auth
 * - On success, user gets a confirmation email
 * - The email contains a link back to /auth/callback with a code
 * - That code is exchanged for a session via the callback route
 * 
 * @param formData - Form data from the sign-up form
 * @returns A redirect response with encoded success/error message
 */
export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  // Validate required fields
  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  // Call Supabase Auth API to sign up the user
  // The emailRedirectTo option is crucial - it tells Supabase where to redirect
  // after the user clicks the confirmation link in their email
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  // Handle any errors from the sign-up attempt
  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    // Success message - user needs to check email for verification
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

/**
 * Server Action: Sign In
 * 
 * This server action:
 * 1. Extracts credentials from the form submission
 * 2. Creates a server-side Supabase client
 * 3. Attempts to sign in with email/password
 * 4. On success, redirects to the protected area
 * 5. On failure, redirects back to sign-in with an error
 * 
 * Note: The session cookie is automatically set by Supabase
 * when signInWithPassword succeeds.
 * 
 * @param formData - Form data from the sign-in form
 * @returns A redirect response to either protected area or sign-in with error
 */
export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  // Attempt to sign in with email/password
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // If there's an error, redirect back to sign-in with the error message
  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // If successful, redirect to the protected area
  return redirect("/protected");
};

/**
 * Server Action: Forgot Password
 * 
 * This server action:
 * 1. Gets the email address from the form
 * 2. Calls Supabase's resetPasswordForEmail method
 * 3. Sends a password reset email with a magic link
 * 
 * The flow:
 * - User requests a password reset
 * - They receive an email with a reset link
 * - The link takes them to /auth/callback with a code
 * - That route processes the code and redirects to reset-password page
 * - User sets a new password on the reset-password page
 * 
 * @param formData - Form data from the forgot password form
 * @returns A redirect response with encoded success/error message
 */
export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  // Email is required
  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  // Send password reset email
  // The redirectTo option determines where user goes after clicking the reset link
  // We send them to our auth callback route with a redirect_to parameter
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  });

  // Handle any errors
  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  // If a specific callback URL was provided, use that
  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  // Otherwise, show success message
  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

/**
 * Server Action: Reset Password
 * 
 * This server action:
 * 1. Gets the new password from the reset password form
 * 2. Validates that passwords match
 * 3. Calls Supabase's updateUser method to set the new password
 * 
 * Note: This action can only work when the user has a valid session
 * after clicking the reset password link from their email.
 * 
 * @param formData - Form data from the reset password form
 * @returns A redirect response with encoded success/error message
 */
export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate that both password fields are filled
  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Password and confirm password are required",
    );
  }

  // Validate that passwords match
  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Passwords do not match",
    );
  }

  // Update the user's password
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  // Handle any errors
  if (error) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Password update failed",
    );
  }

  // Success message
  encodedRedirect("success", "/reset-password", "Password updated");
};

/**
 * Server Action: Sign Out
 * 
 * This server action:
 * 1. Creates a server-side Supabase client
 * 2. Calls Supabase's signOut method
 * 3. Redirects the user to the sign-in page
 * 
 * Note: signOut() clears the auth cookies automatically
 * 
 * @returns A redirect response to the sign-in page
 */
export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
