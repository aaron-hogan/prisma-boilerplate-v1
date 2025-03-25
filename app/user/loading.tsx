/**
 * Loading component for user dashboard
 * 
 * This component is displayed during user page transitions and data fetching.
 */
export default function UserLoading() {
  return (
    <div className="w-full p-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Skeleton for the sidebar */}
        <div className="md:w-48 shrink-0">
          <div className="flex flex-col space-y-1 animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        
        {/* Skeleton for the main content */}
        <div className="md:flex-1 border rounded-lg shadow-sm p-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="ml-4 text-sm text-muted-foreground">Loading user data...</p>
          </div>
        </div>
      </div>
    </div>
  );
}