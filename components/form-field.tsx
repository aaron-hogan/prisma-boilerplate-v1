'use client';

import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormFieldProps {
  label: string | ReactNode;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  defaultValue?: string;
  children?: ReactNode;
}

/**
 * Standardized form field component that combines label and input
 * with consistent styling and accessibility
 */
export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  minLength,
  autoComplete,
  defaultValue,
  children
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      {typeof label === 'string' ? (
        <Label htmlFor={name}>{label}</Label>
      ) : (
        label
      )}
      
      {children || (
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
        />
      )}
    </div>
  );
}