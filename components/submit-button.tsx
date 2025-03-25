"use client";

import { Button } from "@/components/ui/button";
import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
  wrapperClassName?: string;
  showSpinner?: boolean;
};

/**
 * An enhanced submit button with loading state
 * 
 * Features:
 * - Shows loading indicator when form is submitting
 * - Disables button during submission
 * - Optional wrapper div for positioning
 */
export function SubmitButton({
  children,
  pendingText = "Submitting...",
  wrapperClassName,
  showSpinner = true,
  ...props
}: Props) {
  const { pending } = useFormStatus();
  
  const loadingIndicator = showSpinner ? (
    <span className="inline-block mr-2">
      <span className="animate-spin inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full" 
        aria-hidden="true" />
    </span>
  ) : null;
  
  const button = (
    <Button 
      type="submit" 
      aria-disabled={pending} 
      disabled={pending}
      {...props}
    >
      {pending ? (
        <>
          {showSpinner && loadingIndicator}
          <span>{pendingText}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
  
  // If wrapper class provided, wrap the button
  if (wrapperClassName) {
    return <div className={wrapperClassName}>{button}</div>;
  }
  
  // Otherwise return just the button
  return button;
}
