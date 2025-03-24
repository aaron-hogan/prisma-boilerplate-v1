// app/admin/oranges/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function OrangesManagementPage() {
  const [oranges, setOranges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const supabase = createClient();

  // Get user profile on mount
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch profile from database
          const { data, error } = await supabase
            .from('profiles')
            .select('id, app_role, auth_user_id')
            .eq('auth_user_id', user.id)
            .single();
          
          if (data) {
            setUserProfile(data);
            console.log("Profile loaded:", data);
          } else if (error) {
            console.error('Error fetching profile:', error);
            setMessage(`Profile error: ${error.message}`);
          }
        }
      } catch (err: any) {
        console.error("Profile fetch error:", err);
        setMessage(`Error: ${err.message}`);
      }
    }
    
    fetchUserProfile();
  }, []);

  // Load oranges
  const loadOranges = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, created_by, created_at")
        .eq("type", "ORANGE");

      if (error) {
        setMessage(`Error: ${error.message}`);
        console.error("Load error:", error);
      } else {
        setOranges(data || []);
        setMessage(`Loaded ${data?.length || 0} oranges`);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
      console.error("Load exception:", err);
    }
    setLoading(false);
  };

  // Create orange
  const createOrange = async () => {
    if (!userProfile) {
      setMessage("Cannot create orange: user profile not loaded");
      return;
    }
    
    setLoading(true);
    const price = (Math.random() * 4.5 + 0.5).toFixed(2);
    
    try {
      const { data, error } = await supabase.from("products").insert({
        name: `Orange ${new Date().toISOString().substring(0, 19)}`,
        type: "ORANGE",
        price,
        created_by: userProfile.id,
      }).select();

      if (error) {
        setMessage(`Error: ${error.message}`);
        console.error("Create error:", error);
      } else {
        setMessage("Orange created successfully");
        loadOranges(); // Reload the list
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
      console.error("Create exception:", err);
    }
    setLoading(false);
  };

  // Delete orange
  const deleteOrange = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        setMessage(`Error: ${error.message}`);
        console.error("Delete error:", error);
      } else {
        setMessage("Orange deleted successfully");
        loadOranges(); // Reload the list
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
      console.error("Delete exception:", err);
    }
    setLoading(false);
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Oranges Management</h1>
      <p className="mb-4">This page is accessible only to users with Admin or Staff roles</p>
      
      <div className="flex flex-col gap-4">
        <div className="p-2 border rounded bg-muted mb-4">
          <p>User Profile: {userProfile ? `ID: ${userProfile.id}, Role: ${userProfile.app_role}` : 'Not loaded'}</p>
        </div>
        
        <div className="flex gap-4">
          <Button onClick={loadOranges} disabled={loading}>
            Load Oranges
          </Button>
          <Button onClick={createOrange} disabled={loading || !userProfile}>
            Create Orange
          </Button>
        </div>

        {message && (
          <div className="p-2 border rounded bg-muted">
            {message}
          </div>
        )}

        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Oranges List</h2>
          {oranges.length === 0 ? (
            <p>No oranges found. Try creating one or loading the list.</p>
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