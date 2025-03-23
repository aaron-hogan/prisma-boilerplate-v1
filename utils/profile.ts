import { User } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";

/**
 * Ensures a user has a corresponding profile record
 * 
 * @param user Supabase user object
 * @returns The user's profile (either existing or newly created)
 */
export async function ensureUserProfile(user: User) {
  if (!user) return null;
  
  // Check if a profile already exists
  let profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });
  
  // If no profile exists, create one with default USER role
  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        userId: user.id,
        appRole: 'USER',
      },
    });
    console.log(`Created new profile for user: ${user.id}`);
  }
  
  return profile;
}

/**
 * Gets a user's profile if it exists
 * 
 * @param userId The user's ID from Supabase auth
 * @returns The user's profile or null if not found
 */
export async function getUserProfile(userId: string) {
  if (!userId) return null;
  
  return await prisma.profile.findUnique({
    where: { userId },
  });
}