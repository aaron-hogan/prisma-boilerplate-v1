import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { AuthForm } from "@/components/auth-form";
import { FormField } from "@/components/form-field";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  
  // Handle successful sign-up message
  if ("message" in searchParams) {
    return (
      <div className="w-full border rounded-lg shadow-sm p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

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
        title="Sign up"
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
        
        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="Your password"
          minLength={6}
          required
        />
        
        <SubmitButton 
          className="w-full"
          formAction={signUpAction} 
          pendingText="Signing up..."
          wrapperClassName="mt-2"
        >
          Sign up
        </SubmitButton>
      </AuthForm>
      
      <div className="mt-4">
        <SmtpMessage />
      </div>
    </>
  );
}