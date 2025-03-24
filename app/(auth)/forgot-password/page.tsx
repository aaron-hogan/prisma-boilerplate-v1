import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <>
      <form className="w-full flex flex-col p-4 border rounded-lg shadow-sm">
        <h1 className="text-2xl font-medium mb-2">Reset Password</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Already have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Sign in
          </Link>
        </p>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input name="email" placeholder="you@example.com" required />
          </div>
          <div className="mt-2">
            <SubmitButton 
              className="w-full"
              formAction={forgotPasswordAction}
            >
              Reset Password
            </SubmitButton>
          </div>
          <FormMessage message={searchParams} />
        </div>
      </form>
      <div className="mt-4">
        <SmtpMessage />
      </div>
    </>
  );
}
