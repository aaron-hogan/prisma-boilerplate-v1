/**
 * Loading component for admin routes
 * 
 * This component is displayed during admin page transitions and data fetching.
 */
export default function AdminLoading() {
  return (
    <div className="w-full border rounded-lg shadow-sm p-4">
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading admin data...</p>
      </div>
    </div>
  );
}