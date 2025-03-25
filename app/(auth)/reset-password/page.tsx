import { resetPasswordAction } from "@/app/actions";
import { Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { AuthForm } from "@/components/auth-form";
import { FormField } from "@/components/form-field";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  
  return (
    <AuthForm
      title="Reset password"
      subtitle="Please enter your new password below."
      message={searchParams}
    >
      <FormField
        label="New password"
        name="password"
        type="password"
        placeholder="New password"
        required
        minLength={6}
      />
      
      <FormField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        placeholder="Confirm password"
        required
        minLength={6}
      />
      
      <SubmitButton 
        className="w-full"
        formAction={resetPasswordAction}
        pendingText="Resetting password..."
        wrapperClassName="mt-2"
      >
        Reset password
      </SubmitButton>
    </AuthForm>
  );
}