// app/(protected)/dashboard/page.tsx or your protected page file
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  // Create a server-side Supabase client
  const supabase = await createClient();

  // Get the current user - this validates the session with Supabase Auth
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get the session to access the JWT
  const { data: { session } } = await supabase.auth.getSession();

  // If user is not authenticated, redirect to sign-in page
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Decode JWT to view claims
  let jwtClaims = null;
  try {
    if (session?.access_token) {
      jwtClaims = jwtDecode(session.access_token);
    }
  } catch (error) {
    console.error("Error decoding JWT:", error);
  }

  return (
    <div className="w-full">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated user
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start mt-8">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
        
        <h2 className="font-bold text-2xl mb-4 mt-4">Your JWT claims</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(jwtClaims, null, 2)}
        </pre>
        
        <h2 className="font-bold text-2xl mb-4 mt-4">Raw access token</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto text-wrap whitespace-pre-wrap">
          {session?.access_token}
        </pre>
      </div>
    </div>
  );
}