'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const admin = isAdmin();
      
      setIsAuthorized(authenticated && admin);
      setIsChecking(false);
      
      if (!authenticated) {
        router.replace('/login');
      } else if (!admin) {
        router.replace('/dashboard');
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-slate-300">Checking admin access...</div>
      </div>
    );
  }

  return <>{children}</>;
}

