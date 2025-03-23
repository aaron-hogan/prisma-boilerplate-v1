// utils/profile.ts
import { User } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";

export async function ensureUserProfile(user: User) {
  if (!user?.id) {
    console.error("No user ID provided to ensureUserProfile");
    return null;
  }
  
  console.log(`Ensuring profile for user ID: ${user.id}`);
  
  try {
    // Check if profile already exists
    let profile = await prisma.profile.findUnique({
      where: { authUserId: user.id }
    });
    
    // If profile doesn't exist, create it with default USER role
    if (!profile) {
      console.log(`Creating new profile for user ${user.id}`);
      profile = await prisma.profile.create({
        data: {
          authUserId: user.id,
          // AppRole.USER is the default as specified in the schema
        }
      });
      console.log(`Created new profile with ID ${profile.id}`);
    } else {
      console.log(`Profile already exists for user ${user.id} (Profile ID: ${profile.id})`);
    }
    
    return profile;
  } catch (error) {
    console.error(`Error in ensureUserProfile: ${error}`);
    // Don't throw, so the auth flow can continue
    return null;
  }
}