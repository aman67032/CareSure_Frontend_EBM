'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

interface PatientAuthGuardProps {
  children: React.ReactNode;
}

// Simple JWT decode (base64 decode payload)
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export default function PatientAuthGuard({ children }: PatientAuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Check authentication with retry mechanism
    const checkAuth = () => {
      let attempts = 0;
      const maxAttempts = 5;
      
      const tryCheck = () => {
        attempts++;
        const token = getToken();
        
        if (token) {
          const decoded = decodeJWT(token);
          // Check if token is for a patient
          if (decoded && decoded.type === 'patient') {
            setIsAuth(true);
            setIsChecking(false);
          } else if (attempts < maxAttempts) {
            setTimeout(tryCheck, 100);
          } else {
            setIsAuth(false);
            setIsChecking(false);
            if (typeof window !== 'undefined') {
              window.location.href = '/patient/login';
            }
          }
        } else if (attempts < maxAttempts) {
          setTimeout(tryCheck, 100);
        } else {
          setIsAuth(false);
          setIsChecking(false);
          if (typeof window !== 'undefined') {
            window.location.href = '/patient/login';
          }
        }
      };
      
      tryCheck();
    };

    const timeoutId = setTimeout(checkAuth, 50);
    
    return () => clearTimeout(timeoutId);
  }, [router]);

  if (isChecking || !isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="text-amber-800">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}

