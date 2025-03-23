// app/admin/apples/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function ApplesManagementPage() {
  const [apples, setApples] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  // Load apples
  const loadApples = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price")
      .eq("type", "APPLE");

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setApples(data || []);
      setMessage(`Loaded ${data?.length || 0} apples`);
    }
    setLoading(false);
  };

  // Create apple
  const createApple = async () => {
    setLoading(true);
    // Generate a random price between 0.50 and 3.00
    const price = (Math.random() * 2.5 + 0.5).toFixed(2);
    
    const { data, error } = await supabase.from("products").insert({
      name: `Apple ${new Date().toISOString().substring(0, 19)}`,
      type: "APPLE",
      price,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    }).select();

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Apple created successfully");
      loadApples(); // Reload the list
    }
    setLoading(false);
  };

  // Delete apple (only ADMIN can do this)
  const deleteApple = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Apple deleted successfully");
      loadApples(); // Reload the list
    }
    setLoading(false);
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Apples Management</h1>
      <p className="mb-4">This page is accessible to users with Admin role (delete) or Admin/Staff roles (create)</p>
      
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Button onClick={loadApples} disabled={loading}>
            Load Apples
          </Button>
          <Button onClick={createApple} disabled={loading}>
            Create Apple
          </Button>
        </div>

        {message && (
          <div className="p-2 border rounded bg-muted">
            {message}
          </div>
        )}

        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Apples List</h2>
          {apples.length === 0 ? (
            <p>No apples found. Try creating one or loading the list.</p>
          ) : (
            <ul className="space-y-2">
              {apples.map((apple) => (
                <li key={apple.id} className="p-2 border rounded flex justify-between items-center">
                  <span>
                    {apple.name} - ${apple.price}
                  </span>
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