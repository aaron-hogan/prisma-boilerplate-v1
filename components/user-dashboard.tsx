'use client';

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
import { jwtDecode } from "jwt-decode";
import { createClient } from "@/utils/supabase/client";
import { Badge } from "@/components/ui/badge";

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

export default function UserDashboard({ initialData, successMessage, initialTab }: UserDashboardProps) {
  // Set initial tab from URL parameter if provided, otherwise default to 'profile'
  const [activeTab, setActiveTab] = useState<'profile' | 'purchases' | 'member'>(
    initialTab === 'purchases' ? 'purchases' : 
    initialTab === 'member' ? 'member' : 'profile'
  );
  const [userRole, setUserRole] = useState<string>(initialData.profile.appRole);
  
  // Check if user is a member or higher role
  const isMember = ['MEMBER', 'STAFF', 'ADMIN'].includes(userRole);
  
  // Get user role from JWT on component mount
  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        try {
          const decoded = jwtDecode<any>(session.access_token);
          if (decoded.app_role) {
            setUserRole(decoded.app_role);
          }
        } catch (error) {
          console.error('Error decoding JWT:', error);
        }
      }
    };
    
    fetchUserRole();
  }, []);
  
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
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-4 border-b-2 ${activeTab === 'profile' 
              ? 'border-primary font-semibold text-primary' 
              : 'border-transparent'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`py-2 px-4 border-b-2 ${activeTab === 'purchases' 
              ? 'border-primary font-semibold text-primary' 
              : 'border-transparent'}`}
          >
            Purchases
          </button>
          {isMember && (
            <button
              onClick={() => setActiveTab('member')}
              className={`py-2 px-4 border-b-2 ${activeTab === 'member' 
                ? 'border-primary font-semibold text-primary' 
                : 'border-transparent'}`}
            >
              Member Area
            </button>
          )}
        </div>
      </div>
      
      {/* Tab content */}
      <div className="border rounded-lg shadow-sm p-4">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {initialData.user.email}</p>
            <p><span className="font-medium">Role:</span> {initialData.profile.appRole}</p>
            <p><span className="font-medium">Account Created:</span> {new Date(initialData.profile.createdAt).toLocaleDateString()}</p>
          </div>
        )}
        
        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <>
            {initialData.purchases.length === 0 ? (
              <div className="py-4">
                <p>You haven't made any purchases yet.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {initialData.purchases.map((purchase) => (
                  <li key={purchase.id} className="border-b pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{purchase.product.name}</span>
                        <div className="text-sm text-gray-500">Type: {purchase.product.type}</div>
                        <div className="text-xs text-gray-500">
                          Purchased: {new Date(purchase.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="font-bold">${Number(purchase.total).toFixed(2)}</span>
                        <div className="text-xs text-gray-500">Qty: {purchase.quantity}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        
        {/* Member Tab */}
        {activeTab === 'member' && isMember && (
          <div>
            {/* Membership Status */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Membership Status</h2>
                <Badge className="bg-green-500">Active</Badge>
              </div>
              
              <div className="space-y-4">
                <p>
                  Thank you for being a valued member! Your membership gives you access to exclusive
                  products and features.
                </p>
                {initialData.profile.membership?.endDate && (
                  <p className="text-muted-foreground">
                    Your membership is valid until: <span className="font-medium">{new Date(initialData.profile.membership.endDate).toLocaleDateString()}</span>
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
        )}
      </div>
    </div>
  );
}