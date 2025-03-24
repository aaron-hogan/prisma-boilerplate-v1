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
    const refreshAndRedirect = async () => {
      try {
        setStatus('Refreshing your session...');
        const supabase = createClient();
        
        // First explicitly refresh the session to get updated JWT claims
        const { error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Session refresh failed:', error);
          setStatus('Error activating membership. Redirecting...');
          // Still redirect even on error, but with a longer delay
          setTimeout(() => router.push('/user'), 2000);
          return;
        }
        
        setStatus('Session refreshed! Activating your membership...');
        
        // Short delay to ensure cookies are properly set
        // This is recommended by Supabase for handling auth state transitions
        setTimeout(() => {
          // Then redirect to the user page with member tab
          router.push('/user?tab=member');
        }, 800);
      } catch (err) {
        console.error('Error in refreshAndRedirect:', err);
        setStatus('Something went wrong. Redirecting to dashboard...');
        setTimeout(() => router.push('/user'), 2000);
      }
    };
    
    refreshAndRedirect();
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