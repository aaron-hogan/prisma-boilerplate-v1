'use client';

import { ReactNode } from "react";
import { FormMessage, Message } from "@/components/form-message";

interface AuthFormProps {
  children: ReactNode;
  title?: string;
  subtitle?: ReactNode;
  message?: Message;
  action?: (formData: FormData) => Promise<void> | void;
  className?: string;
}

/**
 * Standardized authentication form component with consistent layout and styling
 */
export function AuthForm({
  children,
  title,
  subtitle,
  message,
  action,
  className = ""
}: AuthFormProps) {
  return (
    <form 
      action={action}
      className={`w-full flex flex-col p-4 border rounded-lg shadow-sm ${className}`}
    >
      {title && <h1 className="text-2xl font-medium mb-2">{title}</h1>}
      
      {subtitle && (
        <p className="text-sm text-muted-foreground mb-6">
          {subtitle}
        </p>
      )}
      
      <div className="flex flex-col gap-4">
        {children}
        
        {message && <FormMessage message={message} />}
      </div>
    </form>
  );
}