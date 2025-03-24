/**
 * Apples Management Page
 * 
 * This page imports the ProductManagement component and configures it for apples.
 * The component handles all the CRUD operations with proper role-based access control:
 * - ADMIN and STAFF roles can view and create apples
 * - ADMIN role can delete any apple
 * - Creators can delete their own apples
 */
import ProductManagement from "@/components/product-management";

export default function ApplesManagementPage() {
  return <ProductManagement productType="APPLE" title="Apples Management" />;
}