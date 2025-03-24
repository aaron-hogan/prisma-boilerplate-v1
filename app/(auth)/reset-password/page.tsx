import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <form className="w-full flex flex-col p-4 border rounded-lg shadow-sm">
      <h1 className="text-2xl font-medium mb-2">Reset password</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Please enter your new password below.
      </p>
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            type="password"
            name="password"
            placeholder="New password"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            required
          />
        </div>
        <div className="mt-2">
          <SubmitButton 
            className="w-full"
            formAction={resetPasswordAction}
          >
            Reset password
          </SubmitButton>
        </div>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
