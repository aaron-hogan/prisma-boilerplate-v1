"use client";

/**
 * User Dashboard Component
 *
 * A client component that provides a tabbed interface for user profile, purchases,
 * and member area (if the user is a member).
 *
 * Features:
 * - Tabs for Profile, Purchases, and Member Area (conditional)
 * - Preserves tab selection during navigation
 * - Responsive design for mobile and desktop
 */

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getUserRoleAction } from "@/app/actions";

interface UserData {
   user: {
      email: string;
      id: string;
   };
   profile: {
      appRole: string;
      createdAt: string;
      id: string;
      membership?: {
         startDate: string;
         endDate: string | null;
      } | null;
   };
   purchases: Array<{
      id: string;
      total: string;
      quantity: number;
      createdAt: string;
      deletedAt?: string | null;
      product: {
         id: string;
         name: string;
         type: string;
         price: string;
      };
   }>;
}

interface UserDashboardProps {
   initialData: UserData;
   successMessage?: string | null;
   initialTab?: string | null;
}

export default function UserDashboard({
   initialData,
   successMessage,
   initialTab,
}: UserDashboardProps) {
   const router = useRouter();

   // Set initial tab from URL parameter if provided, otherwise default to 'profile'
   const [activeTab, setActiveTab] = useState<
      "profile" | "purchases" | "member"
   >(
      initialTab === "purchases"
         ? "purchases"
         : initialTab === "member"
           ? "member"
           : "profile"
   );
   const [userRole, setUserRole] = useState<string>(
      initialData.profile.appRole
   );
   const [purchases, setPurchases] = useState(initialData.purchases);
   const [cancelLoading, setCancelLoading] = useState<string | null>(null);

   // Check if user is a member or higher role - this is computed from the current state
   const isMember = ["MEMBER", "STAFF", "ADMIN"].includes(userRole);
   
   // Watch userRole and adjust activeTab if needed
   useEffect(() => {
      // If user role changes and they're no longer a member but the member tab is active,
      // switch to profile tab
      if (!isMember && activeTab === "member") {
         setActiveTab("profile");
      }
   }, [userRole, isMember, activeTab]);
   
   // Function to refresh JWT token from server
   const refreshUserToken = async () => {
      const supabase = createClient();
      await supabase.auth.refreshSession();
      await fetchUserRole();
   };

   // Function to fetch user role using server action
   // This avoids client-side JWT decoding for better security
   const fetchUserRole = async () => {
      try {
         const role = await getUserRoleAction();
         if (role) {
            setUserRole(role);
         }
      } catch (error) {
         console.error("Error fetching user role:", error);
      }
   };

   // Get user role from JWT on component mount
   useEffect(() => {
      fetchUserRole();
   }, []);

   // Note: cancelPurchase function was removed as part of code cleanup
   // Functionality is now handled by the more comprehensive cancelMembership function

   return (
      <div className="w-full p-4">
         <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
         <p className="mb-6">Manage your account, purchases, and membership</p>

         {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 mb-6">
               {successMessage}
            </div>
         )}

         {/* Tab navigation */}
         <div className="border-b mb-6">
            <div className="flex space-x-2">
               <button
                  onClick={() => setActiveTab("profile")}
                  className={`py-2 px-4 border-b-2 ${
                     activeTab === "profile"
                        ? "border-primary font-semibold text-primary"
                        : "border-transparent"
                  }`}
               >
                  Profile
               </button>
               <button
                  onClick={() => setActiveTab("purchases")}
                  className={`py-2 px-4 border-b-2 ${
                     activeTab === "purchases"
                        ? "border-primary font-semibold text-primary"
                        : "border-transparent"
                  }`}
               >
                  Purchases
               </button>
               {isMember && (
                  <button
                     onClick={() => setActiveTab("member")}
                     className={`py-2 px-4 border-b-2 ${
                        activeTab === "member"
                           ? "border-primary font-semibold text-primary"
                           : "border-transparent"
                     }`}
                  >
                     Member Area
                  </button>
               )}
            </div>
         </div>

         {/* Tab content */}
         <div className="border rounded-lg shadow-sm p-4">
            {/* Profile Tab */}
            {activeTab === "profile" && (
               <div className="space-y-2">
                  <p>
                     <span className="font-medium">Email:</span>{" "}
                     {initialData.user.email}
                  </p>
                  <p>
                     <span className="font-medium">Role:</span>{" "}
                     {initialData.profile.appRole}
                  </p>
                  <p>
                     <span className="font-medium">Account Created:</span>{" "}
                     {new Date(
                        initialData.profile.createdAt
                     ).toLocaleDateString()}
                  </p>
               </div>
            )}

            {/* Purchases Tab */}
            {activeTab === "purchases" && (
               <>
                  {purchases.length === 0 ? (
                     <div className="py-4">
                        <p>You haven't made any purchases yet.</p>
                     </div>
                  ) : (
                     <div>
                        <div className="mb-4">
                           <p className="text-sm text-muted-foreground">
                              View your purchase history below. You can cancel
                              any purchase if needed.
                           </p>
                        </div>
                        <ul className="space-y-4">
                           {purchases.map((purchase) => (
                              <li
                                 key={purchase.id}
                                 className={`border rounded-md p-3 ${
                                    purchase.deletedAt 
                                       ? "bg-muted dark:bg-gray-800" 
                                       : "bg-card dark:bg-card"
                                 }`}
                              >
                                 <div className="flex justify-between items-start gap-4">
                                    <div>
                                       <div className="flex items-center gap-2">
                                          <span className="font-medium">
                                             {purchase.product.name}
                                          </span>
                                          {purchase.deletedAt && (
                                             <Badge
                                                variant="outline"
                                                className="text-red-500 border-red-200 bg-red-50"
                                             >
                                                Cancelled
                                             </Badge>
                                          )}
                                       </div>
                                       <div className="text-sm mt-1 text-muted-foreground">
                                          Type: {purchase.product.type}
                                       </div>
                                       <div className="text-xs text-gray-500 mt-1">
                                          Purchased:{" "}
                                          {new Date(
                                             purchase.createdAt
                                          ).toLocaleDateString()}
                                       </div>
                                       {purchase.deletedAt && (
                                          <div className="text-xs text-red-500 mt-1">
                                             Cancelled:{" "}
                                             {new Date(
                                                purchase.deletedAt
                                             ).toLocaleDateString()}
                                          </div>
                                       )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                       <span className="font-bold">
                                          ${Number(purchase.total).toFixed(2)}
                                       </span>
                                       <div className="text-xs text-gray-500">
                                          Qty: {purchase.quantity}
                                       </div>

                                       {/* Only show cancel button for active purchases */}
                                       {!purchase.deletedAt && (
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={() => {
                                                const isMembership =
                                                   purchase.product.type ===
                                                   "MEMBERSHIP";
                                                const confirmMessage =
                                                   isMembership
                                                      ? "Are you sure you want to cancel your membership? You will lose access to member benefits immediately."
                                                      : "Are you sure you want to cancel this purchase?";

                                                if (
                                                   window.confirm(
                                                      confirmMessage
                                                   )
                                                ) {
                                                   // The function only needs the purchase object
                                                   cancelMembership(purchase);
                                                }
                                             }}
                                             disabled={
                                                cancelLoading === purchase.id
                                             }
                                          >
                                             {cancelLoading === purchase.id
                                                ? "Cancelling..."
                                                : "Cancel Purchase"}
                                          </Button>
                                       )}
                                    </div>
                                 </div>
                              </li>
                           ))}
                        </ul>
                     </div>
                  )}
               </>
            )}

            {/* Member Tab - Only render when user has appropriate role */}
            {activeTab === "member" && isMember ? (
               <div>
                  {/* Membership Status */}
                  <div className="mb-8">
                     <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">
                           Membership Status
                        </h2>
                        <Badge className="bg-green-500">Active</Badge>
                     </div>

                     <div className="space-y-4">
                        <p>
                           Thank you for being a valued member! Your membership
                           gives you access to exclusive products and features.
                        </p>
                        {initialData.profile.membership?.endDate && (
                           <p className="text-muted-foreground">
                              Your membership is valid until:{" "}
                              <span className="font-medium">
                                 {new Date(
                                    initialData.profile.membership.endDate
                                 ).toLocaleDateString()}
                              </span>
                           </p>
                        )}
                        <div className="pt-4">
                           <h3 className="font-semibold mb-2">
                              Member Benefits:
                           </h3>
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
            ) : activeTab === "member" ? (
               // Fallback when non-member tries to access member tab
               <div className="p-4 text-center">
                  <p className="text-lg mb-4">You don't have an active membership.</p>
                  <p className="mb-8">Your membership may have been cancelled or expired.</p>
                  <Button 
                     onClick={() => setActiveTab("profile")}
                     className="mx-auto"
                  >
                     Go to Profile
                  </Button>
               </div>
            ) : null}
         </div>
      </div>
   );
   
   // Consolidated function to handle purchase cancellation
   async function cancelMembership(purchase: UserData['purchases'][0]) {
      setCancelLoading(purchase.id);
      try {
         const isMembership = purchase.product.type === "MEMBERSHIP";
         
         // For membership purchases, use the membership API endpoint
         if (isMembership) {
            const response = await fetch(
               `/api/memberships/${initialData.profile.id}`,
               { method: "DELETE" }
            );
            
            const result = await response.json();
            
            if (response.ok) {
               // Mark purchase as cancelled
               setPurchases((prev) =>
                  prev.map((p) =>
                     p.id === purchase.id
                        ? { ...p, deletedAt: new Date().toISOString() }
                        : p
                  )
               );
               
               // Immediately update the client-side user role
               setUserRole("USER");
               
               // Switch tab if we're on the member tab
               if (activeTab === "member") {
                  setActiveTab("profile");
               }
               
               // Refresh the JWT token to get updated claims
               await refreshUserToken();
               
               // Force page refresh to update server components
               router.refresh();
            } else {
               console.error("Failed to cancel membership:", result.error);
               alert(`Error: ${result.error || "Could not cancel membership"}`);
            }
         } else {
            // For regular purchases, use the purchases API endpoint
            const response = await fetch(`/api/purchases/${purchase.id}`, {
               method: "DELETE",
            });
            
            const result = await response.json();
            
            if (response.ok) {
               // Update the purchases list to mark this purchase as cancelled
               setPurchases((prev) =>
                  prev.map((p) =>
                     p.id === purchase.id
                        ? { ...p, deletedAt: new Date().toISOString() }
                        : p
                  )
               );
            } else {
               console.error("Failed to cancel purchase:", result.error);
               alert(`Error: ${result.error || "Could not cancel purchase"}`);
            }
         }
      } catch (error) {
         console.error("Error cancelling purchase:", error);
         alert("An error occurred while trying to cancel the purchase");
      } finally {
         setCancelLoading(null);
      }
   }
}