'use client';

/**
 * Special client-side redirect component
 * This bypasses any middleware or server-side redirects by using client-side navigation
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SpecialRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect directly to user page with member tab using client-side navigation
    router.push('/user?tab=member');
  }, [router]);
  
  // Display loading message while redirect happens
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Welcome to your membership!</h2>
        <p className="mb-4">Taking you to your member dashboard...</p>
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}