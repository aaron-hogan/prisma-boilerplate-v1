import { forgotPasswordAction } from "@/app/actions";
import { Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { AuthForm } from "@/components/auth-form";
import { FormField } from "@/components/form-field";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  
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
    <>
      <AuthForm
        title="Reset Password"
        subtitle={subtitle}
        message={searchParams}
      >
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
        
        <SubmitButton 
          className="w-full"
          formAction={forgotPasswordAction}
          pendingText="Sending reset link..."
          wrapperClassName="mt-2"
        >
          Reset Password
        </SubmitButton>
      </AuthForm>
      
      <div className="mt-4">
        <SmtpMessage />
      </div>
    </>
  );
}