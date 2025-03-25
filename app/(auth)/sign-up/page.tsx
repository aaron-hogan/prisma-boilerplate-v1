import { SignUpForm } from "@/components/sign-up-form";
import { FormMessage, Message } from "@/components/form-message";
import { SmtpMessage } from "../smtp-message";

export default async function SignUp(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  
  // Handle legacy successful sign-up message from redirect
  if ("message" in searchParams) {
    return (
      <div className="w-full border rounded-lg shadow-sm p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      {/* Use client-side form with toast notifications */}
      <SignUpForm />
      
      <div className="mt-4">
        <SmtpMessage />
      </div>
    </>
  );
}