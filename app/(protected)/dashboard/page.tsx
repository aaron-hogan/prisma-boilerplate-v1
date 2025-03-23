// app/(protected)/dashboard/page.tsx
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Decode JWT to view claims - this is the most important part
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
          Welcome to your dashboard!
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