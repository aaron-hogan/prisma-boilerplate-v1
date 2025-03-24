/**
 * Oranges Management Page
 * 
 * This client component implements a CRUD interface for orange products.
 * It demonstrates role-based access control (RBAC) where:
 * - ADMIN and STAFF roles can view and create oranges
 * - ADMIN role can delete any orange
 * - Creators can delete their own oranges
 * 
 * Features:
 * - Loads and displays all orange products
 * - Creates new orange products with random prices
 * - Deletes orange products (admin can delete any, creators can delete their own)
 * - Displays user profile and role information
 * 
 * The page uses Supabase client for data operations with Row Level Security (RLS)
 * policies enforced on the database side.
 */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { getCreatorInfo } from "@/utils/profile";

/**
 * Interface for product data structure
 */
interface Product {
  id: string;
  name: string;
  price: number;
  type: 'APPLE' | 'ORANGE';
  created_by: string;
  created_at: string;
  creator?: {
    id: string;
    auth_user_id: string;
    app_role: 'ADMIN' | 'STAFF' | 'MEMBER' | 'USER';
  };
  creatorInfo?: {
    displayName: string;
    email?: string;
    role?: string;
  };
}

/**
 * Interface for user profile data structure
 */
interface UserProfile {
  id: string;
  auth_user_id: string;
  app_role: 'ADMIN' | 'STAFF' | 'MEMBER' | 'USER';
}

export default function OrangesManagementPage() {
  // State management with proper type annotations
  const [oranges, setOranges] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const supabase = createClient();

  /**
   * Effect that runs when the component mounts to:
   * 1. Fetch the user's profile
   * 2. Load orange products once the profile is available
   */
  useEffect(() => {
    // Flag to track if the component is still mounted
    let isMounted = true;
    
    async function initialize() {
      try {
        // First, fetch the authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && isMounted) {
          // Fetch profile from database
          const { data, error } = await supabase
            .from('profiles')
            .select('id, app_role, auth_user_id')
            .eq('auth_user_id', user.id)
            .single();
          
          if (data && isMounted) {
            setUserProfile(data);
            // Once we have the profile, load the oranges automatically
            loadOranges();
          } else if (error && isMounted) {
            setMessage(`Profile error: ${error.message}`);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setMessage(`Error: ${err.message}`);
        }
      }
    }
    
    initialize();
    
    // Cleanup function to prevent state updates if the component unmounts
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Loads orange products from the database along with creator profiles
   * @param preserveMessage - If true, won't update the message unless there's an error
   */
  const loadOranges = async (preserveMessage = false) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, 
          name, 
          price, 
          created_by, 
          created_at, 
          type,
          creator:profiles(id, auth_user_id, app_role)
        `)
        .eq("type", "ORANGE");

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        // Ensure all items have the type field, even if it wasn't returned
        const typedData = data?.map(item => ({
          ...item,
          type: 'ORANGE' as const
        })) || [];
        
        // Load creator info for each orange
        Promise.all(
          typedData.map(async (orange) => {
            try {
              const creatorInfo = await getCreatorInfo(supabase, orange.created_by);
              if (creatorInfo) {
                orange.creatorInfo = creatorInfo;
              }
            } catch (err) {
              console.error(`Error loading creator info for orange ${orange.id}:`, err);
            }
            return orange;
          })
        ).then(orangesWithCreatorInfo => {
          setOranges(orangesWithCreatorInfo);
          // Only update the message if we're not preserving the current one
          if (!preserveMessage) {
            setMessage(`Loaded ${orangesWithCreatorInfo.length} oranges`);
          }
        });
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  /**
   * Creates a new orange product in the database
   * Uses the user's profile ID for the created_by field
   */
  const createOrange = async () => {
    if (!userProfile) {
      setMessage("Cannot create orange: user profile not loaded");
      return;
    }
    
    setLoading(true);
    // Generate a random price between $0.50 and $5.00
    const price = (Math.random() * 4.5 + 0.5).toFixed(2);
    
    try {
      // Create product data with proper typing
      const newProduct = {
        name: `Orange ${new Date().toISOString().substring(0, 19)}`,
        type: "ORANGE" as const,
        price,
        created_by: userProfile.id,
      };
      
      const { data, error } = await supabase
        .from("products")
        .insert(newProduct)
        .select();

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Orange created successfully");
        // Pass true to preserve the success message
        loadOranges(true);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  /**
   * Deletes an orange product from the database by ID
   * Note: This operation is restricted by RLS policies to the creator of the orange
   * 
   * @param id - The unique identifier of the orange product to delete
   */
  const deleteOrange = async (id: string) => {
    setLoading(true);
    try {
      // First, check if the user can read this orange (RLS might prevent it)
      const { data: orangeData } = await supabase
        .from("products")
        .select("id, created_by")
        .eq("id", id)
        .maybeSingle();
      
      // Then attempt the delete operation
      const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
        
      // Check for RLS policy violations by comparing before and after
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else if (orangeData && !userProfile?.id) {
        setMessage("Error: User profile not loaded");
      } else if (orangeData && orangeData.created_by !== userProfile?.id && userProfile?.app_role !== 'ADMIN') {
        // Orange exists but user didn't create it and is not an admin
        setMessage("Permission denied: Only admins or the creator can delete oranges");
      } else if (!orangeData) {
        // Orange doesn't exist or user can't see it
        setMessage("Orange not found or you don't have permission to delete it");
      } else {
        // Success case (either admin or creator)
        setMessage("Orange deleted successfully");
        // Pass true to preserve the success message
        loadOranges(true);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Oranges Management</h1>
      <p className="mb-4">This page is accessible only to users with Admin or Staff roles</p>
      
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Button onClick={createOrange} disabled={loading || !userProfile}>
            Create Orange
          </Button>
          <Button onClick={() => loadOranges()} disabled={loading} variant="outline">
            Refresh
          </Button>
        </div>

        {message && (
          <div className="p-2 border rounded bg-muted">
            {message}
          </div>
        )}

        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Oranges List</h2>
          {loading ? (
            <p>Loading oranges...</p>
          ) : oranges.length === 0 ? (
            <p>No oranges found. Try creating one.</p>
          ) : (
            <ul className="space-y-2">
              {oranges.map((orange) => (
                <li key={orange.id} className="p-2 border rounded flex justify-between items-center">
                  <div>
                    <span className="block">{orange.name} - ${orange.price}</span>
                    <span className="block text-xs text-gray-500">Created by: {orange.creatorInfo?.displayName || orange.creator?.auth_user_id || orange.created_by}</span>
                    <span className="block text-xs text-gray-500">Created: {new Date(orange.created_at).toLocaleString()}</span>
                  </div>
                  {/* Only show delete button to ADMINs or the creator */}
                  {(userProfile?.app_role === 'ADMIN' || orange.created_by === userProfile?.id) && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteOrange(orange.id)}
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}