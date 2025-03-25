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
import prisma from "@/lib/prisma";
import { jwtDecode } from "jwt-decode";

// Import JwtPayload interface from shared auth types
import { JwtPayload, AppRole } from "@/utils/auth.types";
import { getJwtClaims, hasPermission } from "@/utils/auth";
import { ActionResponse, ActionStatus, FormActionState } from "@/types/action-responses";

/**
 * Helper function to revoke a user's membership
 * 
 * This function:
 * 1. Updates the user's role back to USER
 * 2. Sets the membership end date to now
 * 3. Updates JWT claims if needed
 * 
 * @param profileId - ID of the profile to revoke membership from
 * @param isOwnProfile - Whether the user is modifying their own profile
 * @returns Object indicating success or failure with a message
 */
async function revokeMembership(profileId: string, isOwnProfile: boolean) {
   const supabase = await createClient();
   
   try {
      // 1. Update profile role to USER
      await prisma.profile.update({
         where: { id: profileId },
         data: { appRole: 'USER' }
      });
      
      // 2. End membership by setting endDate to current date
      const membership = await prisma.membership.findUnique({
         where: { profileId }
      });
      
      if (membership) {
         await prisma.membership.update({
            where: { id: membership.id },
            data: { 
               endDate: new Date() // Set to current date (ending the membership)
            }
         });
      }
      
      // 3. Update JWT claims to reflect new role
      // Only update the user's own JWT if they're modifying their own profile
      if (isOwnProfile) {
         await supabase.auth.updateUser({
            data: { app_role: 'USER' }
         });
      }
      
      return { success: true, message: "Membership successfully revoked" };
   } catch (error) {
      console.error("Error revoking membership:", error);
      return { success: false, message: "Failed to revoke membership" };
   }
}

/**
 * Server Action: Revoke Membership
 * 
 * This server action:
 * 1. Verifies the user is authenticated
 * 2. Checks permission (user can revoke their own membership or admin can revoke any)
 * 3. Calls the revokeMembership function to update database and JWT token
 * 4. Redirects with success/error message
 * 
 * @param formData - Form data containing profileId
 * @returns Response with success/error message
 */
export const revokeMembershipAction = async (formData: FormData) => {
   const profileId = formData.get("profileId") as string;
   const supabase = await createClient();
   
   // Get authenticated user
   const { data: { user } } = await supabase.auth.getUser();
   
   if (!user) {
      return encodedRedirect("error", "/user", "Authentication required");
   }
   
   // Get user's profile
   const profile = await prisma.profile.findUnique({
      where: { authUserId: user.id },
   });
   
   if (!profile) {
      return encodedRedirect("error", "/user", "Profile not found");
   }
   
   // Check if user is admin or the owner of the profile
   const isAdmin = profile.appRole === "ADMIN";
   const isOwner = profile.id === profileId;
   
   if (!isAdmin && !isOwner) {
      return encodedRedirect("error", "/user", "Permission denied");
   }
   
   // Call the revokeMembership helper function
   const result = await revokeMembership(profileId, isOwner);
   
   if (result.success) {
      // After successful revocation, just go to user page
      return encodedRedirect("success", "/user", result.message);
   } else {
      return encodedRedirect("error", "/user", result.message);
   }
};

/**
 * Server Action: Sign Up (Legacy version with redirect)
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
 * Server Action: Sign Up with State
 *
 * This improved version:
 * 1. Uses useActionState hook-compatible response format
 * 2. Returns structured success/error information instead of redirecting
 * 3. Can be used with the Sonner toast notification system
 *
 * @param prevState - Previous state from useActionState hook
 * @param formData - Form data from the sign-up form
 * @returns FormActionState object with status information
 */
export async function signUpWithState(
   prevState: FormActionState | undefined,
   formData: FormData
): Promise<FormActionState> {
   const email = formData.get("email")?.toString();
   const password = formData.get("password")?.toString();
   const supabase = await createClient();
   const origin = (await headers()).get("origin");

   // Validate required fields
   if (!email || !password) {
      return {
         status: "error",
         message: "Email and password are required",
         fieldErrors: {
            email: !email ? "Email is required" : "",
            password: !password ? "Password is required" : ""
         }
      };
   }

   try {
      // Call Supabase Auth API to sign up the user
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
         return {
            status: "error",
            message: error.message
         };
      }

      // Return success state
      return {
         status: "success",
         message: "Thanks for signing up! Please check your email for a verification link."
      };
   } catch (error) {
      console.error("Sign up error:", error);
      return {
         status: "error",
         message: error instanceof Error ? error.message : "An unexpected error occurred"
      };
   }
};

/**
 * Server Action: Sign In (Legacy version with redirect)
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

         // Check if user has an expired membership and update role if needed
         const profile = await prisma.profile.findUnique({
            where: { authUserId: data.user.id },
            include: { membership: true },
         });

         if (profile && profile.appRole === "MEMBER") {
            // If user has no membership or if it has expired, downgrade to USER
            if (
               !profile.membership ||
               (profile.membership.endDate &&
                  profile.membership.endDate < new Date())
            ) {
               // Update profile role to USER
               await prisma.profile.update({
                  where: { id: profile.id },
                  data: { appRole: "USER" },
               });

               // Update JWT claims
               await supabase.auth.updateUser({
                  data: { app_role: "USER" },
               });

               console.log(
                  `User ${profile.id} downgraded from MEMBER to USER due to expired membership`
               );
            }
         }
      } catch (profileError) {
         // Log error but continue auth flow - user can still sign in
         // The profile creation can be retried on subsequent requests
         console.error(
            "Error ensuring user profile during sign in:",
            profileError
         );
      }
   }

   // Refresh the session to get updated JWT claims
   await supabase.auth.refreshSession();

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
            redirectPath = "/user?tab=member";
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
 * Server Action: Sign In with State
 *
 * This improved version:
 * 1. Uses useActionState hook-compatible response format
 * 2. Returns structured success/error information instead of redirecting
 * 3. Can be used with the Sonner toast notification system
 * 4. Includes redirect information as part of the response
 *
 * @param prevState - Previous state from useActionState hook
 * @param formData - Form data from the sign-in form
 * @returns FormActionState object with status information
 */
export async function signInWithState(
   prevState: FormActionState | undefined,
   formData: FormData
): Promise<FormActionState> {
   const email = formData.get("email") as string;
   const password = formData.get("password") as string;
   
   // Validate required fields
   if (!email || !password) {
      return {
         status: "error",
         message: "Email and password are required",
         fieldErrors: {
            email: !email ? "Email is required" : "",
            password: !password ? "Password is required" : ""
         }
      };
   }
   
   try {
      const supabase = await createClient();
      
      // Attempt to sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
         email,
         password,
      });
      
      // If there's an error, return error state
      if (error) {
         return {
            status: "error",
            message: error.message
         };
      }
      
      // Ensure user profile exists in the database
      if (data?.user) {
         try {
            await ensureUserProfile(data.user);
            
            // Check if user has an expired membership and update role if needed
            const profile = await prisma.profile.findUnique({
               where: { authUserId: data.user.id },
               include: { membership: true },
            });
            
            if (profile && profile.appRole === "MEMBER") {
               if (
                  !profile.membership ||
                  (profile.membership.endDate &&
                     profile.membership.endDate < new Date())
               ) {
                  // Update profile role to USER
                  await prisma.profile.update({
                     where: { id: profile.id },
                     data: { appRole: "USER" },
                  });
                  
                  // Update JWT claims
                  await supabase.auth.updateUser({
                     data: { app_role: "USER" },
                  });
               }
            }
         } catch (profileError) {
            console.error("Error ensuring user profile:", profileError);
            // Non-fatal error, continue
         }
      }
      
      // Refresh the session to get updated JWT claims
      await supabase.auth.refreshSession();
      
      // Determine where to redirect based on user role
      let redirectPath = "/user"; // Default redirect
      let userRole = "USER";
      
      // Get the user's role from the access token
      if (data?.session?.access_token) {
         try {
            const decoded = jwtDecode<JwtPayload>(data.session.access_token);
            userRole = decoded.app_role || "USER";
            
            // Set redirect path based on role
            if (["ADMIN", "STAFF"].includes(userRole)) {
               redirectPath = "/admin";
            } else if (userRole === "MEMBER") {
               redirectPath = "/user?tab=member";
            }
         } catch (jwtError) {
            console.error("Error decoding JWT:", jwtError);
            // On error, use default redirect path
         }
      }
      
      // Return success with redirectPath in the data
      return {
         status: "success",
         message: `Welcome back! Signed in as ${userRole.toLowerCase()}.`,
         data: { redirectPath }
      };
   } catch (error) {
      console.error("Sign in error:", error);
      return {
         status: "error",
         message: error instanceof Error ? error.message : "An unexpected error occurred"
      };
   }
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
      return encodedRedirect(
         "error",
         "/reset-password",
         "Passwords do not match"
      );
   }

   // Update the user's password
   // This operation requires an active session which is automatically
   // provided by Supabase after the user clicks the reset link in their email
   const { error } = await supabase.auth.updateUser({
      password: password,
   });

   // Handle any errors during password update
   if (error) {
      return encodedRedirect(
         "error",
         "/reset-password",
         "Password update failed"
      );
   }

   // Success message with return statement to properly complete the flow
   return encodedRedirect(
      "success",
      "/reset-password",
      "Password updated successfully"
   );
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
 * Server Action: Get User Role
 * 
 * This server action:
 * 1. Uses the secure getJwtClaims helper to get user claims
 * 2. Extracts the user's role from the JWT claims
 * 3. Returns the role as a string
 * 
 * Security note: This moves JWT decoding to the server side,
 * avoiding exposing JWT details in client-side code.
 * 
 * @returns The user's role as a string
 */
export const getUserRoleAction = async (): Promise<AppRole | null> => {
   try {
      const claims = await getJwtClaims();
      return (claims?.app_role as AppRole) || null;
   } catch (error) {
      console.error("Error getting user role:", error);
      return null;
   }
};

/**
 * Server Action: Purchase Product
 * 
 * This improved server action:
 * 1. Verifies authentication
 * 2. Creates a purchase record
 * 3. Updates user role if needed (for memberships)
 * 4. Updates JWT claims directly
 * 5. Refreshes the session to ensure new claims are active
 * 6. Redirects to the appropriate dashboard
 */
export const purchaseProductAction = async (formData: FormData) => {
  const productId = formData.get("productId") as string;
  let supabase;
  
  try {
    supabase = await createClient();
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get product type to determine if authentication is required
    const product = await prisma.product.findUnique({ 
      where: { id: productId } 
    });
    
    if (!product) {
      return redirect("/products?error=Product+not+found");
    }
    
    // For membership products, allow redirect to sign-in/sign-up
    if (product.type === 'MEMBERSHIP' && !user) {
      return redirect("/sign-up?redirectTo=/products");
    }
    
    // For all other products, require authentication
    if (!user) {
      return redirect("/sign-in");
    }
    
    // Get user's profile
    const profile = await prisma.profile.findUnique({ 
      where: { authUserId: user.id } 
    });
    
    if (!profile) {
      return redirect("/products?error=Profile+not+found");
    }
    
    // Policy check: Only members, staff, and admins can purchase apples
    if (product.type === 'APPLE' && !['MEMBER', 'STAFF', 'ADMIN'].includes(profile.appRole)) {
      return redirect("/products?error=Only+members+can+purchase+apples");
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
    
    // If this is a membership product, update the user's role
    if (product.type === 'MEMBERSHIP') {
      // Update profile role to MEMBER
      await prisma.profile.update({
        where: { id: profile.id },
        data: { appRole: 'MEMBER' }
      });
      
      // Create or update membership record
      const existingMembership = await prisma.membership.findUnique({
        where: { profileId: profile.id }
      });
      
      if (existingMembership) {
        // Update existing membership (extend end date by 1 year from now)
        await prisma.membership.update({
          where: { id: existingMembership.id },
          data: { 
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
          }
        });
      } else {
        // Create new membership
        await prisma.membership.create({
          data: {
            profileId: profile.id,
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
          }
        });
      }
      
      // Update JWT claims directly
      await supabase.auth.updateUser({
        data: { app_role: 'MEMBER' }
      });
      
      // Explicitly refresh the session to get new claims
      await supabase.auth.refreshSession();
      
      // Refresh token via dedicated endpoint for extra reliability
      // Note: Don't wrap this in try/catch as it's not critical to the flow
      await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(refreshError => {
        console.error("Error calling refresh endpoint:", refreshError);
        // Non-blocking error handling - continue with redirect
      });
      
      // Redirect to user dashboard with member tab active
      // IMPORTANT: Don't put this inside a try/catch as Next.js uses exceptions for redirects
      return redirect("/user?tab=member&success=Membership+activated+successfully");
    }
    
    // Redirect to user page with purchases tab for non-membership products
    // IMPORTANT: Don't put this inside a try/catch as Next.js uses exceptions for redirects
    return redirect("/user?tab=purchases&success=Purchase+completed+successfully");
  } catch (error) {
    // Only catch actual errors, not redirect exceptions
    // Check if it's a redirect exception (which isn't actually an error)
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      // Re-throw redirect exceptions to let Next.js handle them
      throw error;
    }
    
    console.error("Purchase error:", error);
    
    // Redirect with error message only for actual errors
    return redirect("/products?error=Purchase+failed");
  }
};