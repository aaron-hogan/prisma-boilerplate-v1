'use client';

import { purchaseProductAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

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

export default function ProductList({ products, isAuthenticated }: ProductListProps) {
  return (
    <div className="border rounded-lg shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-4">Available Products</h2>
      
      {products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <ul className="space-y-2">
          {products.map((product) => (
            <li key={product.id} className="border-b pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{product.name}</span>
                  <div className="text-sm text-gray-500">Type: {product.type}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">${Number(product.price).toFixed(2)}</span>
                  
                  {/* Purchase form */}
                  <form action={purchaseProductAction}>
                    <input type="hidden" name="productId" value={product.id} />
                    <SubmitButton className="text-xs">
                      {isAuthenticated ? "Buy" : "Sign in to buy"}
                    </SubmitButton>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}