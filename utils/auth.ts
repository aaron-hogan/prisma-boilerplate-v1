// utils/auth.ts
import { jwtDecode } from "jwt-decode";
import { createClient } from "@/utils/supabase/server";

// Define JWT structure for decoding
interface JwtPayload {
  [key: string]: any;
}

/**
 * Get the JWT claims from the current session
 */
export async function getJwtClaims() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) return null;
  
  try {
    return jwtDecode<JwtPayload>(session.access_token);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}