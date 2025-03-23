import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/utils/profile";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create a server-side Supabase client
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is not authenticated, redirect to sign-in page
  if (!user) {
    return redirect("/sign-in");
  }

  // Ensure the user has a profile
  await ensureUserProfile(user);

  return (
    <div className="flex-1 w-full flex flex-col gap-12 max-w-5xl">
      {children}
    </div>
  );
}