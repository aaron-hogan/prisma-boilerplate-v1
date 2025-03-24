/**
 * Oranges Management Page
 * 
 * This page imports the ProductManagement component and configures it for oranges.
 * The component handles all the CRUD operations with proper role-based access control:
 * - ADMIN and STAFF roles can view and create oranges
 * - ADMIN role can delete any orange
 * - Creators can delete their own oranges
 */
import ProductManagement from "@/components/product-management";

export default function OrangesManagementPage() {
  return <ProductManagement productType="ORANGE" title="Oranges Management" />;
}