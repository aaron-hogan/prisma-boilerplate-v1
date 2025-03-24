"use server";

/**
 * Simplified Authentication Server Actions Module
 *
 * A cleaner implementation of server actions for auth and purchases with
 * more direct token handling and JWT claim updates.
 */

import { createClient } from "@/utils/supabase/simplified-server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

/**
 * Server Action: Purchase Product
 * 
 * This simplified server action:
 * 1. Verifies authentication
 * 2. Creates a purchase record
 * 3. Updates user role if needed (for memberships)
 * 4. Updates JWT claims directly
 * 5. Redirects to the appropriate dashboard
 */
export const purchaseProductAction = async (formData: FormData) => {
  const productId = formData.get("productId") as string;
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get product type to determine if authentication is required
  const product = await prisma.product.findUnique({ 
    where: { id: productId } 
  });
  
  if (!product) {
    return redirect("/products?error=Product+not+found");
  }
  
  // For membership products, allow redirect to sign-in/sign-up
  if (product.type === 'MEMBERSHIP' && !user) {
    return redirect("/sign-up?redirectTo=/products");
  }
  
  // For all other products, require authentication
  if (!user) {
    return redirect("/sign-in");
  }
  
  try {
    // Get user's profile
    const profile = await prisma.profile.findUnique({ 
      where: { authUserId: user.id } 
    });
    
    if (!profile) {
      return redirect("/products?error=Profile+not+found");
    }
    
    // Policy check: Only members, staff, and admins can purchase apples
    if (product.type === 'APPLE' && !['MEMBER', 'STAFF', 'ADMIN'].includes(profile.appRole)) {
      return redirect("/products?error=Only+members+can+purchase+apples");
    }
    
    // Create the purchase record
    await prisma.purchase.create({
      data: {
        quantity: 1,
        total: product.price,
        profileId: profile.id,
        productId: product.id
      }
    });
    
    // If this is a membership product, update the user's role
    if (product.type === 'MEMBERSHIP') {
      // Update profile role to MEMBER
      await prisma.profile.update({
        where: { id: profile.id },
        data: { appRole: 'MEMBER' }
      });
      
      // Create or update membership record
      const existingMembership = await prisma.membership.findUnique({
        where: { profileId: profile.id }
      });
      
      if (existingMembership) {
        // Update existing membership (extend end date by 1 year from now)
        await prisma.membership.update({
          where: { id: existingMembership.id },
          data: { 
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
          }
        });
      } else {
        // Create new membership
        await prisma.membership.create({
          data: {
            profileId: profile.id,
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
          }
        });
      }
      
      // Update JWT claims directly
      await supabase.auth.updateUser({
        data: { app_role: 'MEMBER' }
      });
      
      // Explicitly refresh the session to get new claims
      await supabase.auth.refreshSession();
      
      // Redirect to user dashboard with member tab active
      return redirect("/user-simplified?tab=member&success=Membership+activated+successfully");
    }
    
    // Redirect to user page with purchases tab for non-membership products
    return redirect("/user-simplified?tab=purchases&success=Purchase+completed+successfully");
  } catch (error) {
    console.error("Purchase error:", error);
    
    // Redirect with error message
    return redirect("/products?error=Purchase+failed");
  }
};