// app/(member)/layout.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // For now, no RBAC check - we'll add this later

  return (
    <div className="flex-1 w-full flex flex-col gap-12 max-w-5xl">
      {children}
    </div>
  );
}