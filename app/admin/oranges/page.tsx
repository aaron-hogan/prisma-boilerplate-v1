// app/admin/oranges/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function OrangesManagementPage() {
  const [oranges, setOranges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  // Load oranges
  const loadOranges = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price")
      .eq("type", "ORANGE");

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setOranges(data || []);
      setMessage(`Loaded ${data?.length || 0} oranges`);
    }
    setLoading(false);
  };

  // Create orange
  const createOrange = async () => {
    setLoading(true);
    // Generate a random price between 0.50 and 5.00
    const price = (Math.random() * 4.5 + 0.5).toFixed(2);
    
    const { data, error } = await supabase.from("products").insert({
      name: `Orange ${new Date().toISOString().substring(0, 19)}`,
      type: "ORANGE",
      price,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    }).select();

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Orange created successfully");
      loadOranges(); // Reload the list
    }
    setLoading(false);
  };

  // Delete orange
  const deleteOrange = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Orange deleted successfully");
      loadOranges(); // Reload the list
    }
    setLoading(false);
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Oranges Management</h1>
      <p className="mb-4">This page is accessible only to users with Admin or Staff roles</p>
      
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Button onClick={loadOranges} disabled={loading}>
            Load Oranges
          </Button>
          <Button onClick={createOrange} disabled={loading}>
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
                  <span>
                    {orange.name} - ${orange.price}
                  </span>
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