"use client";

import { Button } from "@/components/ui/button";
import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
  wrapperClassName?: string;
};

/**
 * An enhanced submit button with loading state
 * 
 * Features:
 * - Shows different text when form is submitting
 * - Disables button during submission
 * - Optional wrapper div for positioning
 */
export function SubmitButton({
  children,
  pendingText = "Submitting...",
  wrapperClassName,
  ...props
}: Props) {
  const { pending } = useFormStatus();
  
  const button = (
    <Button 
      type="submit" 
      aria-disabled={pending} 
      disabled={pending}
      {...props}
    >
      {pending ? pendingText : children}
    </Button>
  );
  
  // If wrapper class provided, wrap the button
  if (wrapperClassName) {
    return <div className={wrapperClassName}>{button}</div>;
  }
  
  // Otherwise return just the button
  return button;
}
