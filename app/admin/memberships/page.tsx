/**
 * Memberships Management Page
 * 
 * This page imports the ProductManagement component and configures it for memberships.
 * The component handles all the CRUD operations with proper role-based access control:
 * - ADMIN and STAFF roles can view and create memberships
 * - Only ADMIN role can delete memberships
 * - Regular STAFF cannot delete memberships (same policy as apples)
 */
import ProductManagement from "@/components/product-management";

export default function MembershipsManagementPage() {
  return <ProductManagement productType="MEMBERSHIP" title="Memberships Management" />;
}