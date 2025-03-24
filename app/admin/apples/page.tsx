/**
 * Apples Management Page
 * 
 * This client component implements a CRUD interface for apple products.
 * It demonstrates role-based access control (RBAC) where:
 * - ADMIN and STAFF roles can view and create apples
 * - Only ADMIN role can delete apples (enforced by RLS policies)
 * 
 * Features:
 * - Loads and displays all apple products
 * - Creates new apple products with random prices
 * - Deletes apple products (admin only)
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

export default function ApplesManagementPage() {
  // State management with proper type annotations
  const [apples, setApples] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const supabase = createClient();

  /**
   * Effect that runs when the component mounts to:
   * 1. Fetch the user's profile
   * 2. Load apple products once the profile is available
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
            // Once we have the profile, load the apples automatically
            loadApples();
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
   * Loads apple products from the database
   * @param preserveMessage - If true, won't update the message unless there's an error
   */
  const loadApples = async (preserveMessage = false) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, created_by, created_at, type")
        .eq("type", "APPLE");

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        // Ensure all items have the type field, even if it wasn't returned
        const typedData = data?.map(item => ({
          ...item,
          type: 'APPLE' as const
        })) || [];
        
        setApples(typedData);
        
        // Only update the message if we're not preserving the current one
        if (!preserveMessage) {
          setMessage(`Loaded ${typedData.length} apples`);
        }
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  /**
   * Creates a new apple product in the database
   * Uses the user's profile ID for the created_by field
   */
  const createApple = async () => {
    if (!userProfile) {
      setMessage("Cannot create apple: user profile not loaded");
      return;
    }
    
    setLoading(true);
    // Generate a random price between $0.50 and $3.00
    const price = (Math.random() * 2.5 + 0.5).toFixed(2);
    
    try {
      // Create product data with proper typing
      const newProduct = {
        name: `Apple ${new Date().toISOString().substring(0, 19)}`,
        type: "APPLE" as const,
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
        setMessage("Apple created successfully");
        // Pass true to preserve the success message
        loadApples(true); 
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  /**
   * Deletes an apple product from the database by ID
   * Note: This operation is restricted by RLS policies to ADMIN role only
   * 
   * @param id - The unique identifier of the apple product to delete
   */
  const deleteApple = async (id: string) => {
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
        setMessage("Apple deleted successfully");
        // Pass true to preserve the success message
        loadApples(true);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Apples Management</h1>
      <p className="mb-4">This page is accessible only to users with Admin or Staff roles</p>
      
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Button onClick={createApple} disabled={loading || !userProfile}>
            Create Apple
          </Button>
          <Button onClick={loadApples} disabled={loading} variant="outline">
            Refresh
          </Button>
        </div>

        {message && (
          <div className="p-2 border rounded bg-muted">
            {message}
          </div>
        )}

        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Apples List</h2>
          {loading ? (
            <p>Loading apples...</p>
          ) : apples.length === 0 ? (
            <p>No apples found. Try creating one.</p>
          ) : (
            <ul className="space-y-2">
              {apples.map((apple) => (
                <li key={apple.id} className="p-2 border rounded flex justify-between items-center">
                  <div>
                    <span className="block">{apple.name} - ${apple.price}</span>
                    <span className="text-xs text-gray-500">Created: {new Date(apple.created_at).toLocaleString()}</span>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => deleteApple(apple.id)}
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