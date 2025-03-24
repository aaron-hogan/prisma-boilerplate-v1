'use client';

/**
 * User Dashboard Component
 *
 * A streamlined implementation of the dashboard with clean state management
 * and direct role checking from JWT claims.
 */

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ProductManagement from "@/components/product-management";

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
  activeTab?: string | null;
}

export default function UserDashboard({
  initialData,
  successMessage,
  activeTab = "profile",
}: UserDashboardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"profile" | "purchases" | "member" | "admin">(
    activeTab === "admin" ? "admin" :
    activeTab === "member" ? "member" : 
    activeTab === "purchases" ? "purchases" : "profile"
  );
  const [userData, setUserData] = useState(initialData);
  const [purchases, setPurchases] = useState(initialData.purchases);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);

  // Check role from profile data
  const isMember = ["MEMBER", "STAFF", "ADMIN"].includes(userData.profile.appRole);
  const isAdmin = ["ADMIN", "STAFF"].includes(userData.profile.appRole);

  // Fetch fresh user data once on mount
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        // Get fresh user data from the server
        const response = await fetch('/api/user-data');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setPurchases(data.purchases);
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    };

    refreshUserData();
  }, []);

  // Function to cancel membership or purchase
  async function cancelPurchase(purchase: UserData['purchases'][0]) {
    setCancelLoading(purchase.id);
    try {
      const isMembership = purchase.product.type === "MEMBERSHIP";
      
      // For membership purchases, use the membership API endpoint
      if (isMembership) {
        const response = await fetch(
          `/api/memberships/${userData.profile.id}`,
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
          
          // Update user data with new role
          setUserData({
            ...userData,
            profile: {
              ...userData.profile,
              appRole: "USER"
            }
          });
          
          // Switch tab if we're on the member tab
          if (tab === "member") {
            setTab("profile");
          }
          
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

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-6">Manage your account, purchases, and membership</p>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 mb-6">
          {successMessage}
        </div>
      )}

      {/* Main content area with side navigation */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side navigation */}
        <div className="md:w-48 shrink-0">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => setTab("profile")}
              className={`py-2 px-4 text-left rounded ${
                tab === "profile"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-secondary"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setTab("purchases")}
              className={`py-2 px-4 text-left rounded ${
                tab === "purchases"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-secondary"
              }`}
            >
              Purchases
            </button>
            {isMember && (
              <button
                onClick={() => setTab("member")}
                className={`py-2 px-4 text-left rounded ${
                  tab === "member"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-secondary"
                }`}
              >
                Member Area
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setTab("admin")}
                className={`py-2 px-4 text-left rounded ${
                  tab === "admin"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-secondary"
                }`}
              >
                Admin Area
              </button>
            )}
          </div>
        </div>

        {/* Right side content area */}
        <div className="md:flex-1 border rounded-lg shadow-sm p-4">
        {/* Profile Tab */}
        {tab === "profile" && (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Email:</span>{" "}
              {userData.user.email}
            </p>
            <p>
              <span className="font-medium">Role:</span>{" "}
              {userData.profile.appRole}
            </p>
            <p>
              <span className="font-medium">Account Created:</span>{" "}
              {new Date(userData.profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Purchases Tab */}
        {tab === "purchases" && (
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
                            {new Date(purchase.createdAt).toLocaleDateString()}
                          </div>
                          {purchase.deletedAt && (
                            <div className="text-xs text-red-500 mt-1">
                              Cancelled:{" "}
                              {new Date(purchase.deletedAt).toLocaleDateString()}
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
                                  purchase.product.type === "MEMBERSHIP";
                                const confirmMessage = isMembership
                                  ? "Are you sure you want to cancel your membership? You will lose access to member benefits immediately."
                                  : "Are you sure you want to cancel this purchase?";

                                if (window.confirm(confirmMessage)) {
                                  cancelPurchase(purchase);
                                }
                              }}
                              disabled={cancelLoading === purchase.id}
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

        {/* Member Tab */}
        {tab === "member" && (
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
                {userData.profile.membership?.endDate && (
                  <p className="text-muted-foreground">
                    Your membership is valid until:{" "}
                    <span className="font-medium">
                      {new Date(
                        userData.profile.membership.endDate
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
        )}
        
        {/* Admin Tab */}
        {tab === "admin" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-blue-500">
                {userData.profile.appRole}
              </Badge>
            </div>
            
            <p className="mb-4 text-sm text-muted-foreground">
              Manage products from a single dashboard. Each section shows a different product type.
            </p>
            
            {/* Product Management Tabs */}
            <div className="border p-4 rounded-md">
              <div className="mb-4 flex flex-col space-y-8">
                <ProductManagement
                  productType="APPLE"
                  title="Apples Management"
                />
                
                <ProductManagement
                  productType="ORANGE"
                  title="Oranges Management"
                />
                
                {/* Only show MEMBERSHIP tab for ADMIN users */}
                {userData.profile.appRole === "ADMIN" && (
                  <ProductManagement
                    productType="MEMBERSHIP"
                    title="Memberships Management"
                  />
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}