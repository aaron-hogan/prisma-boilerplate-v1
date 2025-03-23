// app/member/layout.tsx
import { canAccessMemberArea } from "@/utils/auth";
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
  
  // Check if user has member permissions
  const hasAccess = await canAccessMemberArea();
  
  if (!hasAccess) {
    return redirect("/dashboard");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 max-w-5xl">
      {children}
    </div>
  );
}