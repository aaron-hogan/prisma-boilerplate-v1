import { redirect } from "next/navigation";
import { RedirectType } from "@/types";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * 
 * @param type - The type of message, either 'error' or 'success'
 * @param path - The path to redirect to
 * @param message - The message to be encoded and added as a query parameter
 * @returns A redirect response from Next.js
 */
export function encodedRedirect(
  type: RedirectType,
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}