"use client";

/**
 * Admin Dashboard Page
 * 
 * This client component provides a tabbed interface for managing different product types.
 * It uses the ProductManagement component for each product type.
 * 
 * Features:
 * - Tabbed interface for managing apples, oranges, and memberships
 * - Uses the shared ProductManagement component
 * - Provides consistent user experience across product types
 */
import ProductManagement from "@/components/product-management";
import { useState } from "react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'APPLE' | 'ORANGE' | 'MEMBERSHIP'>('APPLE');
  
  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-6">Manage all products from a single dashboard</p>
      
      {/* Tab navigation */}
      <div className="border-b mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('APPLE')}
            className={`py-2 px-4 border-b-2 ${activeTab === 'APPLE' 
              ? 'border-primary font-semibold text-primary' 
              : 'border-transparent'}`}
          >
            Apples
          </button>
          <button
            onClick={() => setActiveTab('ORANGE')}
            className={`py-2 px-4 border-b-2 ${activeTab === 'ORANGE' 
              ? 'border-primary font-semibold text-primary' 
              : 'border-transparent'}`}
          >
            Oranges
          </button>
          <button
            onClick={() => setActiveTab('MEMBERSHIP')}
            className={`py-2 px-4 border-b-2 ${activeTab === 'MEMBERSHIP' 
              ? 'border-primary font-semibold text-primary' 
              : 'border-transparent'}`}
          >
            Memberships
          </button>
        </div>
      </div>
      
      {/* Tab content */}
      <div className="border rounded-lg shadow-sm p-4">
        {activeTab === 'APPLE' && (
          <ProductManagement productType="APPLE" title="Apples Management" />
        )}
        {activeTab === 'ORANGE' && (
          <ProductManagement productType="ORANGE" title="Oranges Management" />
        )}
        {activeTab === 'MEMBERSHIP' && (
          <ProductManagement productType="MEMBERSHIP" title="Memberships Management" />
        )}
      </div>
    </div>
  );
}