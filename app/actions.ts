"use server";

/**
 * Authentication Server Actions Module
 * 
 * Implements secure authentication flows using Next.js server actions with Supabase Auth.
 * These server-side functions handle user registration, authentication, password management,
 * and role-based redirects while maintaining security best practices.
 * 
 * Security features:
 * - Server-side only auth operations (no client-side token handling)
 * - HTTP-only cookies for session management
 * - JWT validation for role-based access control
 * - Form validation before auth operations
 * - Secure password reset flow with email verification
 */

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ensureUserProfile } from "@/utils/profile";
import { jwtDecode } from "jwt-decode";

/**
 * JWT Payload Interface
 * 
 * Defines the structure of decoded JWT tokens from Supabase Auth.
 * The app_role claim is set by a Postgres function during token generation
 * and is used for role-based access control throughout the application.
 */
interface JwtPayload {
   app_role?: string;  // User role: ADMIN, STAFF, MEMBER, or USER (default)
   [key: string]: any; // Other standard and custom JWT claims
}

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
         "Email and password are required"
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
         "Thanks for signing up! Please check your email for a verification link."
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
 * 4. On success, redirects to the appropriate area based on user role
 * 5. On failure, redirects back to sign-in with an error
 *
 * Note: The session cookie is automatically set by Supabase
 * when signInWithPassword succeeds.
 *
 * @param formData - Form data from the sign-in form
 * @returns A redirect response to either protected area or sign-in with error
 */
// app/actions.ts
export const signInAction = async (formData: FormData) => {
   const email = formData.get("email") as string;
   const password = formData.get("password") as string;
   const supabase = await createClient();

   // Attempt to sign in with email/password
   const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
   });

   // If there's an error, redirect back to sign-in with the error message
   if (error) {
      return encodedRedirect("error", "/sign-in", error.message);
   }

   // Ensure user profile exists in the database
   // This step is critical for linking Supabase Auth with our application data
   // It creates a profile record if one doesn't exist, or updates it if needed
   if (data?.user) {
      try {
         // ensureUserProfile creates or updates the user's profile in our database
         // This maintains consistency between Auth and application data
         await ensureUserProfile(data.user);
      } catch (profileError) {
         // Log error but continue auth flow - user can still sign in
         // The profile creation can be retried on subsequent requests
         console.error(
            "Error ensuring user profile during sign in:",
            profileError
         );
      }
   }

   // Determine where to redirect based on user role
   let redirectPath = "/user"; // Default redirect

   // Get the user's role from the access token
   if (data?.session?.access_token) {
      try {
         const decoded = jwtDecode<JwtPayload>(data.session.access_token);
         const userRole = decoded.app_role || "USER";

         // Set redirect path based on role
         if (["ADMIN", "STAFF"].includes(userRole)) {
            redirectPath = "/admin";
         } else if (userRole === "MEMBER") {
            redirectPath = "/member";
         }
      } catch (jwtError) {
         console.error("Error decoding JWT:", jwtError);
         // On error, use default redirect path
      }
   }

   // Perform the redirect
   return redirect(redirectPath);
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
         "Could not reset password"
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
      "Check your email for a link to reset your password."
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
      return encodedRedirect(
         "error",
         "/reset-password",
         "Password and confirm password are required"
      );
   }

   // Validate that passwords match
   if (password !== confirmPassword) {
      return encodedRedirect("error", "/reset-password", "Passwords do not match");
   }

   // Update the user's password
   // This operation requires an active session which is automatically 
   // provided by Supabase after the user clicks the reset link in their email
   const { error } = await supabase.auth.updateUser({
      password: password,
   });

   // Handle any errors during password update
   if (error) {
      return encodedRedirect("error", "/reset-password", "Password update failed");
   }

   // Success message with return statement to properly complete the flow
   return encodedRedirect("success", "/reset-password", "Password updated successfully");
};

/**
 * Server Action: Sign Out
 *
 * Securely terminates the user's session by:
 * 1. Creating a server-side Supabase client with cookie access
 * 2. Calling Supabase's signOut method which:
 *    - Invalidates the session on the Supabase server
 *    - Clears all auth cookies from the browser
 *    - Removes local session data
 * 3. Redirects the user to the sign-in page
 *
 * Security note: This server-side approach ensures proper session termination
 * even if client-side JavaScript fails to execute.
 *
 * @returns A redirect response to the sign-in page
 */
export const signOutAction = async () => {
   const supabase = await createClient();
   
   // Invalidate session and clear cookies
   await supabase.auth.signOut();
   
   // Redirect to sign-in page
   return redirect("/sign-in");
};

/**
 * Server Action: Purchase Product
 * 
 * This server action:
 * 1. Verifies the user is authenticated
 * 2. Finds their profile and the requested product
 * 3. Creates a purchase record linking the profile to the product
 * 4. Redirects to the purchases page
 * 
 * Security:
 * - Server-side authentication check prevents unauthorized purchases
 * - Database relations ensure data integrity
 * 
 * @param formData - Form data containing productId
 * @returns Redirect to purchases page or sign-in if not authenticated
 */
export const purchaseProductAction = async (formData: FormData) => {
   const productId = formData.get("productId") as string;
   const supabase = await createClient();
   
   // Get authenticated user
   const { data: { user } } = await supabase.auth.getUser();
   
   // Redirect to sign-in if not authenticated
   if (!user) {
      return redirect("/sign-in");
   }
   
   try {
      // Import prisma within the action to keep module imports clean
      const prisma = (await import("@/lib/prisma")).default;
      
      // Get user's profile
      const profile = await prisma.profile.findUnique({ 
         where: { authUserId: user.id } 
      });
      
      if (!profile) {
         throw new Error("User profile not found");
      }
      
      // Get product details
      const product = await prisma.product.findUnique({ 
         where: { id: productId } 
      });
      
      if (!product) {
         throw new Error("Product not found");
      }
      
      // Create the purchase record
      await prisma.purchase.create({
         data: {
            quantity: 1,
            total: product.price,
            profileId: profile.id,
            productId: product.id
         }
      });
      
      // Redirect to purchases page
      return redirect("/purchases");
   } catch (error) {
      // Basic error handling - in production, we'd want better error messaging
      console.error("Purchase error:", error);
      return encodedRedirect("error", "/products", "Failed to complete purchase");
   }
};
