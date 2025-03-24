// app/test-api/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestApiPage() {
  const [readResult, setReadResult] = useState<any>(null);
  const [createResult, setCreateResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const testReadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-read-product');
      const data = await response.json();
      setReadResult(data);
    } catch (error) {
      console.error('Error testing read:', error);
      setReadResult({ error: 'Failed to fetch' });
    }
    setLoading(false);
  };
  
  const testCreateProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-create-product');
      const data = await response.json();
      setCreateResult(data);
    } catch (error) {
      console.error('Error testing create:', error);
      setCreateResult({ error: 'Failed to fetch' });
    }
    setLoading(false);
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">API Testing Page</h1>
      
      <div className="flex gap-4 mb-4">
        <Button 
          onClick={testReadProducts} 
          disabled={loading}
        >
          Test Read Products
        </Button>
        
        <Button 
          onClick={testCreateProduct} 
          disabled={loading}
        >
          Test Create Product
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h2 className="text-xl mb-2">Read Test Result:</h2>
          <pre className="bg-muted p-2 overflow-auto max-h-96 text-sm">
            {readResult ? JSON.stringify(readResult, null, 2) : 'No results yet'}
          </pre>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-xl mb-2">Create Test Result:</h2>
          <pre className="bg-muted p-2 overflow-auto max-h-96 text-sm">
            {createResult ? JSON.stringify(createResult, null, 2) : 'No results yet'}
          </pre>
        </div>
      </div>
    </div>
  );
}