// app/user/page.tsx
import { createClient } from "@/utils/supabase/server";
import prisma from '@/lib/prisma';
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function UserDashboardPage() {
  // Verify user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { authUserId: user.id }
  });
  
  if (!profile) {
    return (
      <div className="w-full p-4">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p>Unable to locate your user profile. Please contact support.</p>
      </div>
    );
  }
  
  // No purchases needed on profile page
  
  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <p className="mb-6">Account Information</p>
      
      <div className="border rounded-lg shadow-sm p-4">
        <div className="space-y-2">
          <p><span className="font-medium">Email:</span> {user.email}</p>
          <p><span className="font-medium">Role:</span> {profile.appRole}</p>
          <p><span className="font-medium">Account Created:</span> {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}