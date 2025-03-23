// utils/profile.ts - You can remove this file if not needed right now
import { User } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";
import { Profile } from "@prisma/client";

// Keep this simplified for testing
export async function getUserProfile(userId: string): Promise<Profile | null> {
  if (!userId) return null;
  
  return await prisma.profile.findUnique({
    where: { authUserId: userId },
  });
}