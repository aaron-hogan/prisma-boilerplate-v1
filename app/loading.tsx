/**
 * Global loading component for page transitions
 * 
 * This component is displayed during page transitions and data fetching
 * using Next.js's built-in loading UI feature.
 */
export default function Loading() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
}