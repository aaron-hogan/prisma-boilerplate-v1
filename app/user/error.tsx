'use client'

import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { notify } from "@/lib/notifications"

/**
 * User Section Error Boundary
 * 
 * This component catches errors specific to the user section and
 * provides appropriate recovery options.
 */
export default function UserError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Log error and show notification when error occurs
  useEffect(() => {
    console.error('User section error:', error)
    
    // Show error toast notification
    notify.error('Error loading user data')
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center p-6 my-8 border rounded-lg shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-destructive">User Dashboard Error</h2>
      
      <p className="mb-4 text-muted-foreground text-center">
        We encountered an error loading your user information.<br />
        This could be due to a temporary system issue.
      </p>
      
      {/* Only show error message in development environment */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-3 my-4 overflow-auto text-sm rounded-md bg-muted w-full max-w-md">
          <p className="text-destructive font-mono">
            {error.message || 'An unknown error occurred'}
          </p>
        </div>
      )}
      
      <div className="flex gap-4 mt-6">
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/'}
        >
          Go to Homepage
        </Button>
        
        <Button 
          variant="default" 
          onClick={reset}
        >
          Try Again
        </Button>
      </div>
    </div>
  )
}