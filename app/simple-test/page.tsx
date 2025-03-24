// app/simple-test/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function SimpleTestPage() {
  const [profile, setProfile] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const supabase = createClient();

  // Get user profile
  const getProfile = async () => {
    try {
      // First, get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Not authenticated");
        return;
      }
      
      // Then, get the profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();
      
      if (error) {
        setError(`Profile error: ${error.message}`);
        return;
      }
      
      setProfile(data);
      setMessage("Profile loaded successfully");
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    }
  };

  // Create a product
  const createProduct = async () => {
    if (!profile) {
      setError("Profile not loaded");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: `Test ${new Date().toISOString()}`,
          type: 'ORANGE',
          price: 1.99,
          created_by: profile.id
        })
        .select()
        .single();
      
      if (error) {
        setError(`Create error: ${error.message}`);
        return;
      }
      
      setProduct(data);
      setMessage("Product created successfully");
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    }
  };

  // Update the product
  const updateProduct = async () => {
    if (!product) {
      setError("No product to update");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          price: Math.round((product.price + 0.5) * 100) / 100
        })
        .eq('id', product.id)
        .select()
        .single();
      
      if (error) {
        setError(`Update error: ${error.message}`);
        return;
      }
      
      setProduct(data);
      setMessage("Product updated successfully");
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    }
  };

  // Delete the product
  const deleteProduct = async () => {
    if (!product) {
      setError("No product to delete");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);
      
      if (error) {
        setError(`Delete error: ${error.message}`);
        return;
      }
      
      setProduct(null);
      setMessage("Product deleted successfully");
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Simple RLS Test</h1>
      
      <div className="mb-4 flex gap-2">
        <Button onClick={getProfile}>Get Profile</Button>
        <Button onClick={createProduct} disabled={!profile}>Create Product</Button>
        <Button onClick={updateProduct} disabled={!product}>Update Product</Button>
        <Button onClick={deleteProduct} disabled={!product}>Delete Product</Button>
      </div>
      
      {message && (
        <div className="p-2 mb-4 border rounded bg-green-50 text-green-800">
          {message}
        </div>
      )}
      
      {error && (
        <div className="p-2 mb-4 border rounded bg-red-50 text-red-800">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        <div className="border p-3 rounded">
          <h3 className="font-medium">Profile</h3>
          <pre className="text-xs bg-gray-100 p-2 mt-2 overflow-auto h-40">
            {profile ? JSON.stringify(profile, null, 2) : "No profile loaded"}
          </pre>
        </div>
        
        <div className="border p-3 rounded">
          <h3 className="font-medium">Product</h3>
          <pre className="text-xs bg-gray-100 p-2 mt-2 overflow-auto h-40">
            {product ? JSON.stringify(product, null, 2) : "No product created"}
          </pre>
        </div>
      </div>
    </div>
  );
}