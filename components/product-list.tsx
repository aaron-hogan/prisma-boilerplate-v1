'use client';

import { purchaseProductWithState } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { useActionState } from "react";
import { FormActionState } from "@/types/action-responses";
import { notify } from "@/lib/notifications";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Product {
  id: string;
  name: string;
  type: string;
  price: number | string;
  createdAt: string;
}

interface ProductListProps {
  products: Product[];
  isAuthenticated: boolean;
}

// Initial state for the purchase form
const initialState: FormActionState = {
  status: 'info',
  message: ''
};

// Product item component with toast notifications for purchase actions
function ProductItem({ product, isAuthenticated }: { product: Product, isAuthenticated: boolean }) {
  const router = useRouter();
  
  // Get form state using useActionState hook
  const [state, formAction] = useActionState(purchaseProductWithState, initialState);
  
  // Handle state changes (success/error) with toast notifications and redirects
  useEffect(() => {
    if (state?.status && state?.message) {
      // Show notification based on status
      notify[state.status](state.message);
      
      // If there's a redirect path in the response data, navigate to it
      if (state.status === 'success' || state.status === 'info') {
        if (state.data?.redirectPath) {
          router.push(state.data.redirectPath);
        }
      }
    }
  }, [state, router]);
  
  return (
    <li className="border-b pb-2">
      <div className="flex justify-between items-center">
        <div>
          <span className="font-medium">{product.name}</span>
          <div className="text-sm text-gray-500">Type: {product.type}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">${Number(product.price).toFixed(2)}</span>
          
          {/* Purchase form with useActionState integration */}
          <form action={formAction}>
            <input type="hidden" name="productId" value={product.id} />
            <SubmitButton className="text-xs">
              {isAuthenticated ? "Buy" : "Sign in to buy"}
            </SubmitButton>
          </form>
        </div>
      </div>
    </li>
  );
}

export default function ProductList({ products, isAuthenticated }: ProductListProps) {
  return (
    <div className="border rounded-lg shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-4">Available Products</h2>
      
      {products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <ul className="space-y-2">
          {products.map((product) => (
            <ProductItem 
              key={product.id} 
              product={product} 
              isAuthenticated={isAuthenticated} 
            />
          ))}
        </ul>
      )}
    </div>
  );
}