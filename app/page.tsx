/**
 * Home Page
 * 
 * Landing page with links to products and dashboard,
 * including a link to our new simplified implementation.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Metrognome PMS</h1>
        <p className="text-lg mb-8">Your one-stop shop for premium fruits and memberships</p>
      </div>
      
      <div className="flex flex-col items-center space-y-4">
        <Button asChild size="lg" className="px-8">
          <Link href="/products">Browse Products</Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Check out our selection of apples, oranges, and membership options!
        </p>
      </div>
      
      <div className="mt-12 p-6 border rounded-lg max-w-2xl w-full">
        <h2 className="text-2xl font-semibold mb-4 text-center">Try Our Simplified Implementation</h2>
        <p className="mb-6 text-center">
          We've created a cleaner implementation of our user dashboard and product pages
          with improved token handling and state management.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="secondary">
            <Link href="/products-simplified">Simplified Products</Link>
          </Button>
          
          <Button asChild variant="secondary">
            <Link href="/user-simplified">Simplified Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}