'use client'

import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { notify } from "@/lib/notifications"

/**
 * Global Error Boundary Component
 * 
 * This component catches unexpected errors in the React component tree
 * and displays a user-friendly error message with a reset button.
 * 
 * It also automatically logs errors and displays a toast notification.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Log error and show notification when error occurs
  useEffect(() => {
    console.error('Application error:', error)
    
    // Show error toast notification
    notify.error('An unexpected error occurred')
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center p-6 my-8 border rounded-lg shadow-sm bg-background">
      <h2 className="mb-4 text-2xl font-bold text-destructive">Something went wrong</h2>
      
      <p className="mb-2 text-muted-foreground">
        We encountered an unexpected error. Our team has been notified.
      </p>
      
      {/* Only show error message in development environment */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-3 my-4 overflow-auto text-sm rounded-md bg-muted w-full max-w-md">
          <p className="text-destructive font-mono">
            {error.message || 'An unknown error occurred'}
          </p>
          {error.stack && (
            <details className="mt-2">
              <summary className="cursor-pointer text-muted-foreground">Stack trace</summary>
              <pre className="mt-2 text-xs overflow-auto max-h-60 p-2 bg-muted-foreground/10 rounded">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      )}
      
      <div className="flex gap-4 mt-6">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
        >
          Go Back
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