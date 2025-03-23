import { createClient } from "@/utils/supabase/server";
import { getUserProfile } from "@/utils/profile";
import { InfoIcon } from "lucide-react";

export default async function DashboardPage() {
  // Create a server-side Supabase client
  const supabase = await createClient();

  // Get the current user - we don't need auth check here since layout handles it
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile - we know it exists because layout ensures it
  const profile = await getUserProfile(user!.id);

  return (
    <div className="w-full">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          Welcome to your dashboard! You are logged in with role: {profile?.appRole}
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start mt-8">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
        <h2 className="font-bold text-2xl mb-4 mt-4">Your profile details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>
    </div>
  );
}