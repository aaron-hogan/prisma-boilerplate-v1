"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { getCreatorInfo } from "@/utils/profile";

/**
 * Interface for product data structure
 */
interface Product {
   id: string;
   name: string;
   price: number;
   type: "APPLE" | "ORANGE" | "MEMBERSHIP";
   created_by: string;
   created_at: string;
   deleted_at?: string | null; // Add this for soft delete
   creator?: {
      id: string;
      auth_user_id: string;
      app_role: "ADMIN" | "STAFF" | "MEMBER" | "USER";
   }[];
   creatorInfo?: {
      // Add this to fix the type error
      displayName: string;
      email?: string;
      role?: string;
   };
}

/**
 * Interface for user profile data structure
 */
interface UserProfile {
   id: string;
   auth_user_id: string;
   app_role: "ADMIN" | "STAFF" | "MEMBER" | "USER";
}

interface ProductManagementProps {
   productType: "APPLE" | "ORANGE" | "MEMBERSHIP";
   title: string;
}

/**
 * Product Management Component
 *
 * This client component implements a CRUD interface for products.
 * It demonstrates role-based access control (RBAC) where:
 * - ADMIN and STAFF roles can view and create products
 * - ADMIN role can delete any product
 * - Creators can delete their own products
 *
 * Features:
 * - Loads and displays products of a specified type
 * - Creates new products with random prices
 * - Deletes products (admin can delete any, creators can delete their own)
 * - Displays user profile and role information
 */
export default function ProductManagement({
   productType,
   title,
}: ProductManagementProps) {
   // State management with proper type annotations
   const [products, setProducts] = useState<Product[]>([]);
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState("");
   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
   const supabase = createClient();

   /**
    * Effect that runs when the component mounts to:
    * 1. Fetch the user's profile
    * 2. Load products once the profile is available
    */
   useEffect(() => {
      // Flag to track if the component is still mounted
      let isMounted = true;

      async function initialize() {
         try {
            // First, fetch the authenticated user
            const {
               data: { user },
            } = await supabase.auth.getUser();

            if (user && isMounted) {
               // Fetch profile from database
               const { data, error } = await supabase
                  .from("profiles")
                  .select("id, app_role, auth_user_id")
                  .eq("auth_user_id", user.id)
                  .single();

               if (data && isMounted) {
                  setUserProfile(data);
                  // Once we have the profile, load the products automatically
                  loadProducts();
               } else if (error && isMounted) {
                  setMessage(`Profile error: ${error.message}`);
               }
            }
         } catch (err: any) {
            if (isMounted) {
               setMessage(`Error: ${err.message}`);
            }
         }
      }

      initialize();

      // Cleanup function to prevent state updates if the component unmounts
      return () => {
         isMounted = false;
      };
   }, []);

   /**
    * Loads products from the database along with creator profiles
    * @param preserveMessage - If true, won't update the message unless there's an error
    */
   const loadProducts = async (preserveMessage = false) => {
      setLoading(true);
      try {
         const { data, error } = await supabase
            .from("products")
            .select(
               `
          id, 
          name, 
          price, 
          created_by, 
          created_at,
          deleted_at, 
          type,
          creator:profiles(id, auth_user_id, app_role)
        `
            )
            .eq("type", productType)
            .is("deleted_at", null); // Filter out soft-deleted products

         if (error) {
            setMessage(`Error: ${error.message}`);
         } else {
            // Ensure all items have the type field, even if it wasn't returned
            const typedData =
               data?.map((item) => ({
                  ...item,
                  type: productType,
               })) || [];

            // Load creator info for each product
            const productsWithCreatorInfo = await Promise.all(
               typedData.map(async (product) => {
                  try {
                     const creatorInfo = await getCreatorInfo(
                        supabase,
                        product.created_by
                     );
                     return {
                        ...product,
                        creatorInfo: creatorInfo || undefined
                     };
                  } catch (err) {
                     // Return product without creator info on error
                     return product;
                  }
               })
            );
            
            setProducts(productsWithCreatorInfo);
         }
      } catch (err: any) {
         setMessage(`Error: ${err.message}`);
      }
      setLoading(false);
   };

   /**
    * Creates a new product in the database
    * Uses the user's profile ID for the created_by field
    */
   const createProduct = async () => {
      if (!userProfile) {
         setMessage(
            `Cannot create ${productType.toLowerCase()}: user profile not loaded`
         );
         return;
      }

      // Check if user has permission to create this product type
      if (productType === "MEMBERSHIP" && userProfile.app_role !== "ADMIN") {
         setMessage(
            `Permission denied: Only administrators can create membership products`
         );
         return;
      }

      setLoading(true);
      // Generate a random price - different ranges for each product type
      let price;
      if (productType === "MEMBERSHIP") {
         // Memberships are more expensive
         price = (Math.random() * (150 - 50) + 50).toFixed(2);
      } else if (productType === "APPLE") {
         price = (Math.random() * (3.0 - 0.5) + 0.5).toFixed(2);
      } else {
         // ORANGE
         price = (Math.random() * (5.0 - 0.5) + 0.5).toFixed(2);
      }

      try {
         // Create product data with proper typing
         const newProduct = {
            name: `${productType} ${new Date().toISOString().substring(0, 19)}`,
            type: productType,
            price,
            created_by: userProfile.id,
         };

         const { data, error } = await supabase
            .from("products")
            .insert(newProduct)
            .select();

         if (error) {
            setMessage(`Error: ${error.message}`);
         } else {
            setMessage(`${productType} created successfully`);
            // Pass true to preserve the success message
            loadProducts(true);
         }
      } catch (err: any) {
         setMessage(`Error: ${err.message}`);
      }
      setLoading(false);
   };

   /**
    * Soft-deletes a product by setting its deletedAt timestamp
    * Note: This operation is restricted by RLS policies and additional app logic:
    * - Only ADMIN can delete any product
    * - STAFF can only delete their own ORANGE products, but no APPLES
    * - Other roles can delete their own products
    * - Products with active purchases cannot be deleted (server-side check)
    *
    * @param id - The unique identifier of the product to soft-delete
    */
   const deleteProduct = async (id: string) => {
      setLoading(true);
      try {
         // Get product information for better error messages
         const { data: productData } = await supabase
            .from("products")
            .select("id, created_by, type, name")
            .eq("id", id)
            .maybeSingle();

         if (!productData) {
            setMessage("Error: Product not found");
            setLoading(false);
            return;
         }

         // Confirm deletion with user
         const confirmMessage = productData.type === "MEMBERSHIP" 
            ? "Are you sure you want to archive this membership product? This will make it unavailable for new subscribers."
            : `Are you sure you want to archive this ${productData.type.toLowerCase()}? It will no longer be available for purchase.`;
            
         if (!window.confirm(confirmMessage)) {
            setLoading(false);
            return;
         }

         // Call the DELETE API endpoint
         const response = await fetch(`/api/products/${id}`, {
            method: "DELETE",
         });

         const result = await response.json();

         if (!response.ok) {
            // Display the server error message
            setMessage(`Error: ${result.error || "Failed to archive product"}`);
         } else {
            setMessage(
               result.message ||
                  `${productData?.type || "Product"} archived successfully`
            );
            // Reload the products list
            loadProducts(true);
         }
      } catch (err: any) {
         setMessage(`Error: ${err.message}`);
      }
      setLoading(false);
   };

   return (
      <div className="w-full">
         <h2 className="text-xl font-semibold mb-3">{title}</h2>

         <div className="flex flex-col gap-3">
            <div className="flex gap-2">
               {/* Only show create button for membership products to admins */}
               {(productType !== "MEMBERSHIP" ||
                  userProfile?.app_role === "ADMIN") && (
                  <Button
                     onClick={createProduct}
                     disabled={loading || !userProfile}
                     size="sm"
                  >
                     Create {productType}
                  </Button>
               )}
               <Button
                  onClick={() => loadProducts()}
                  disabled={loading}
                  variant="outline"
                  size="sm"
               >
                  Refresh
               </Button>
            </div>

            {message && (
               <div className={`p-2 border rounded text-sm ${message.startsWith('Error:') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-muted'}`}>
                  {message}
               </div>
            )}

            <div className="mt-2">
               {loading ? (
                  <p className="text-sm">
                     Loading {productType.toLowerCase()}s...
                  </p>
               ) : products.length === 0 ? (
                  <p className="text-sm">
                     No {productType.toLowerCase()}s found. Try creating one.
                  </p>
               ) : (
                  <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                     {products.map((product) => (
                        <li
                           key={product.id}
                           className="p-2 border rounded flex justify-between items-center text-sm"
                        >
                           <div>
                              <span className="block font-medium">
                                 {product.name} - ${product.price}
                              </span>
                              <span className="block text-xs text-gray-500">
                                 By:{" "}
                                 {product.creatorInfo?.displayName ||
                                    (product.creator && product.creator.length > 0 ? product.creator[0].auth_user_id : product.created_by)}
                              </span>
                              <span className="block text-xs text-gray-500">
                                 {new Date(product.created_at).toLocaleString()}
                              </span>
                           </div>
                           {/* Only show delete button to ADMINs or the creator (with special rule: staff can't delete apples or memberships) */}
                           {(userProfile?.app_role === "ADMIN" ||
                              (userProfile?.app_role === "STAFF" &&
                                 product.type === "ORANGE" &&
                                 product.created_by === userProfile?.id) ||
                              (userProfile?.app_role !== "STAFF" &&
                                 product.created_by === userProfile?.id)) && (
                              <Button
                                 variant="destructive"
                                 size="sm"
                                 onClick={() => deleteProduct(product.id)}
                                 disabled={loading}
                              >
                                 {loading ? "Processing..." : "Archive"}
                              </Button>
                           )}
                        </li>
                     ))}
                  </ul>
               )}
            </div>
         </div>
      </div>
   );
}
