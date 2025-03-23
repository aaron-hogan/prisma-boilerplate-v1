// app/admin/test/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function TestPage() {
  const [message, setMessage] = useState("");
  const supabase = createClient();

  // Basic test to read all products
  const testRead = async () => {
    setMessage("Testing read access...");
    
    // First, check the authentication status
    const { data: authData } = await supabase.auth.getUser();
    console.log("Auth status:", authData);
    
    if (!authData.user) {
      setMessage("Not authenticated!");
      return;
    }
    
    try {
      // Try to read all products
      const { data, error } = await supabase
        .from("products")
        .select("*");
      
      if (error) {
        setMessage(`Read error: ${error.message}`);
        console.error("Read error:", error);
      } else {
        setMessage(`Success! Read ${data.length} products`);
        console.log("Products:", data);
      }
    } catch (e: any) {
      setMessage(`Exception: ${e.message}`);
      console.error("Exception:", e);
    }
  };

  // Create a test orange
  const createTestOrange = async () => {
    setMessage("Creating test orange...");
    
    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: "Test Orange",
          type: "ORANGE",
          price: 1.99,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select();
      
      if (error) {
        setMessage(`Create error: ${error.message}`);
        console.error("Create error:", error);
      } else {
        setMessage("Orange created successfully!");
        console.log("Created:", data);
      }
    } catch (e: any) {
      setMessage(`Exception: ${e.message}`);
      console.error("Exception:", e);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">RLS Testing Page</h1>
      
      <div className="flex gap-4 mb-4">
        <Button onClick={testRead}>Test Read Access</Button>
        <Button onClick={createTestOrange}>Create Test Orange</Button>
      </div>
      
      <div className="p-2 border rounded">
        {message}
      </div>
    </div>
  );
}