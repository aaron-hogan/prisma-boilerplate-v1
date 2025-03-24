'use client';

/**
 * Special client-side redirect component with JWT refresh
 * 
 * This component:
 * 1. Explicitly refreshes the JWT token via Supabase SDK
 * 2. Ensures cookies are properly set with a small delay
 * 3. Redirects to member dashboard only after refresh is complete
 * 
 * This follows Supabase best practices for handling auth state transitions
 * and avoids race conditions between DB updates and JWT claims.
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function SpecialRedirectPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Refreshing your session...');
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const refreshAndRedirect = async () => {
      try {
        console.log('🚀 SPECIAL-REDIRECT PAGE LOADED');
        console.log('🔄 Starting token refresh process');
        setStatus('Refreshing your session...');
        
        // AGGRESSIVE CLEANUP: Clear ALL possible session flags that could interfere
        if (typeof window !== 'undefined') {
          console.log('🧹 Clearing ALL possible session flags');
          sessionStorage.removeItem('attemptedMemberRefresh');
          sessionStorage.setItem('membershipActivated', 'true');
        }
        
        // Try the API endpoint first for more reliable server-side refresh
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          console.log('✅ Server-side refresh successful');
          setStatus('Session refreshed! Activating your membership...');
          
          // Add a longer delay to ensure proper session sync
          timeout = setTimeout(() => {
            router.push('/user?tab=member&fresh=true');
          }, 1500);
          return;
        }
        
        // Fallback to client-side refresh if API fails
        console.log('⚠️ Server-side refresh failed, trying client-side refresh');
        setStatus('Trying alternative refresh method...');
        
        const supabase = createClient();
        const { error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Session refresh failed:', error);
          setStatus('Error activating membership. Retrying...');
          
          // Try one more time after a short delay
          timeout = setTimeout(async () => {
            try {
              const { error: retryError } = await supabase.auth.refreshSession();
              if (!retryError) {
                router.push('/user?tab=member&fresh=true');
              } else {
                // Last resort - full page refresh
                window.location.href = '/user?tab=member&refresh=true';
              }
            } catch (e) {
              console.error("Retry failed:", e);
              window.location.href = '/user?tab=member&fresh=true';
            }
          }, 1000);
          return;
        }
        
        setStatus('Session refreshed! Activating your membership...');
        
        // Short delay to ensure cookies are properly set
        // This is recommended by Supabase for handling auth state transitions
        timeout = setTimeout(() => {
          // Then redirect to the user page with member tab
          router.push('/user?tab=member&fresh=true');
        }, 1500);
      } catch (err) {
        console.error('Error in refreshAndRedirect:', err);
        setStatus('Something went wrong. Redirecting to dashboard...');
        timeout = setTimeout(() => router.push('/user'), 2000);
      }
    };
    
    refreshAndRedirect();
    
    // Clean up timeouts on unmount
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [router]);
  
  // Display loading message with current status while redirect happens
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Welcome to your membership!</h2>
        <p className="mb-4">{status}</p>
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}