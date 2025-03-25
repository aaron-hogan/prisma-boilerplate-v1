/**
 * Loading component for products page
 * 
 * This component is displayed during products page transitions and data fetching.
 */
export default function ProductsLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 animate-pulse">
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Product skeletons */}
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="border rounded-md p-4 animate-pulse">
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded mt-4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}