/**
 * Oranges Management Page
 * 
 * This client component implements a CRUD interface for orange products.
 * It demonstrates role-based access control (RBAC) where:
 * - ADMIN and STAFF roles can view and create oranges
 * - Both ADMIN and STAFF roles can delete oranges (different from apples)
 * 
 * Features:
 * - Loads and displays all orange products
 * - Creates new orange products with random prices
 * - Deletes orange products 
 * - Displays user profile and role information
 * 
 * The page uses Supabase client for data operations with Row Level Security (RLS)
 * policies enforced on the database side.
 */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

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
   * Loads orange products from the database
   * @param preserveMessage - If true, won't update the message unless there's an error
   */
  const loadOranges = async (preserveMessage = false) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, created_by, created_at, type")
        .eq("type", "ORANGE");

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        // Ensure all items have the type field, even if it wasn't returned
        const typedData = data?.map(item => ({
          ...item,
          type: 'ORANGE' as const
        })) || [];
        
        setOranges(typedData);
        
        // Only update the message if we're not preserving the current one
        if (!preserveMessage) {
          setMessage(`Loaded ${typedData.length} oranges`);
        }
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
   * Note: This operation is restricted by RLS policies to ADMIN and STAFF roles
   * 
   * @param id - The unique identifier of the orange product to delete
   */
  const deleteOrange = async (id: string) => {
    setLoading(true);
    try {
      // Delete the product with the specified ID
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
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
          <Button onClick={loadOranges} disabled={loading} variant="outline">
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
                    <span className="text-xs text-gray-500">Created: {new Date(orange.created_at).toLocaleString()}</span>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => deleteOrange(orange.id)}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}