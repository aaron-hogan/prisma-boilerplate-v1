// app/admin/layout.tsx
import { canAccessAdminArea } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }
  
  // Check if user has admin permissions
  const hasAccess = await canAccessAdminArea();
  
  if (!hasAccess) {
    return redirect("/user");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 max-w-5xl">
      {children}
    </div>
  );
}