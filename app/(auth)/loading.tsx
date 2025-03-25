/**
 * Loading component for authentication routes
 * 
 * This component is displayed during auth page transitions and data fetching.
 */
export default function AuthLoading() {
  return (
    <div className="w-full flex flex-col p-4 border rounded-lg shadow-sm">
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}