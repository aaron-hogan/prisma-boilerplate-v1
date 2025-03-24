"use client";

/**
 * Products Management Page
 * 
 * This client component provides a side-by-side interface for managing both apples and oranges.
 * It uses the ProductManagement component for each product type.
 * 
 * Features:
 * - Side-by-side layout for managing apples and oranges simultaneously
 * - Uses the shared ProductManagement component
 * - Provides consistent user experience across product types
 */
import ProductManagement from "@/components/product-management";

export default function ProductsManagementPage() {
  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Products Management</h1>
      <p className="mb-6">Manage apples and oranges from a single view</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg shadow-sm p-4">
          <ProductManagement productType="APPLE" title="Apples Management" />
        </div>
        
        <div className="border rounded-lg shadow-sm p-4">
          <ProductManagement productType="ORANGE" title="Oranges Management" />
        </div>
      </div>
    </div>
  );
}