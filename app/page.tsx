import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
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
    </div>
  );
}
