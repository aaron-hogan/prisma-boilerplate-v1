/**
 * Sign-in Page Component
 * 
 * This page renders the sign-in form and processes authentication via
 * client-side form with useActionState and toast notifications.
 * 
 * Authentication flow:
 * - User submits email/password via client-side form
 * - signInWithState validates credentials and returns status information
 * - On success: shows toast notification and redirects to appropriate area
 * - On failure: shows toast notification with error
 * 
 * Note: Also supports legacy form submission flow with URL-based messages
 */
import { Message, FormMessage } from "@/components/form-message";
import { SignInForm } from "@/components/sign-in-form";

/**
 * Login component for user authentication
 * 
 * @param props.searchParams - Contains error/success messages from legacy form submission
 * @returns The sign-in form with client-side error handling
 */
export default async function Login(props: { searchParams: Promise<Message> }) {
  // Await the search params which may contain error messages from legacy flow
  const searchParams = await props.searchParams;
  
  // Handle legacy error messages from URL parameters
  if ("message" in searchParams) {
    return (
      <>
        {/* Display legacy error message */}
        <div className="w-full border rounded-lg shadow-sm p-4 mb-4">
          <FormMessage message={searchParams} />
        </div>
        
        {/* Render the new client-side form */}
        <SignInForm />
      </>
    );
  }
  
  // Render the client-side form with useActionState and toast notifications
  return <SignInForm />;
}