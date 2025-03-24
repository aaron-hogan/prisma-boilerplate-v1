// app/member/page.tsx

/**
 * Member Dashboard Page
 * 
 * This page shows membership details and a cute cat for members.
 * It is protected by middleware and only accessible to users with MEMBER, ADMIN, or STAFF roles.
 */

import { createClient } from "@/utils/supabase/server";
import { Badge } from "@/components/ui/badge";

export default async function MemberPage() {
  // Get user and membership information
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user profile with membership data
  const prisma = await import("@/lib/prisma").then(module => module.default);
  const profile = await prisma.profile.findUnique({
    where: { authUserId: user!.id },
    include: { membership: true }
  });

  const membershipEndDate = profile?.membership?.endDate 
    ? new Date(profile.membership.endDate).toLocaleDateString() 
    : null;

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Members Area</h1>
      <p className="mb-6">Welcome to the exclusive members area</p>
      
      {/* Membership Status */}
      <div className="bg-card p-6 rounded-lg shadow-md mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Membership Status</h2>
          <Badge className="bg-green-500">Active</Badge>
        </div>
        
        <div className="space-y-4">
          <p>
            Thank you for being a valued member! Your membership gives you access to exclusive
            products and features.
          </p>
          {membershipEndDate && (
            <p className="text-muted-foreground">
              Your membership is valid until: <span className="font-medium">{membershipEndDate}</span>
            </p>
          )}
          <div className="pt-4">
            <h3 className="font-semibold mb-2">Member Benefits:</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Access to exclusive apple products</li>
              <li>Member-only discounts</li>
              <li>Early access to new releases</li>
              <li>Access to the member's lounge with cats</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Cat GIF */}
      <div className="flex flex-col items-center">
        <div className="border rounded-lg overflow-hidden shadow-md mb-4">
          <img 
            src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXVjOTE4bXhkdnZucmZlMnJmajN4ZGl5cGQ5Z2M0Y2JpenhqYWppdCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/SEO7ub2q1fORa/200.webp" 
            alt="Happy cat" 
            width={200} 
            height={200}
            className="max-w-full h-auto"
          />
        </div>
        
        <p className="text-center text-xl mt-4">
          Thanks for being a member! 🐱
        </p>
      </div>
    </div>
  );
}