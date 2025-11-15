'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Check authentication with retry mechanism to handle race conditions
    const checkAuth = () => {
      // Try multiple times with small delays to handle localStorage timing issues
      let attempts = 0;
      const maxAttempts = 5;
      
      const tryCheck = () => {
        attempts++;
        const authenticated = isAuthenticated();
        
        if (authenticated) {
          setIsAuth(true);
          setIsChecking(false);
        } else if (attempts < maxAttempts) {
          // Retry after a short delay (localStorage might not be ready yet)
          setTimeout(tryCheck, 100);
        } else {
          // After max attempts, redirect to login
          setIsAuth(false);
          setIsChecking(false);
          // Use window.location for more reliable redirect
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          } else {
            router.replace('/login');
          }
        }
      };
      
      tryCheck();
    };

    // Small delay to ensure localStorage is accessible
    const timeoutId = setTimeout(checkAuth, 50);
    
    return () => clearTimeout(timeoutId);
  }, [router]);

  // Don't render anything until auth is checked
  if (isChecking || !isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-slate-300">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}

