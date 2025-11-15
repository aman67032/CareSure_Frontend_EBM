'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { removeToken } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setAdmin(isAdmin());
  }, [pathname]);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  // Don't show navbar on login, signup, landing page, or patient routes
  if (pathname === '/login' || pathname === '/signup' || pathname === '/' || pathname?.startsWith('/patient')) {
    return null;
  }

  return (
    <nav className="bg-white/80 backdrop-blur-xl shadow-md border-b border-orange-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="CareSure Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-rose-500 to-violet-600 bg-clip-text text-transparent drop-shadow-sm hover:from-orange-500 hover:via-rose-400 hover:to-violet-500 transition-all duration-300">
                  CareSure
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all duration-300 ${
                  isActive('/dashboard')
                    ? 'border-orange-500 text-orange-600 shadow-sm'
                    : 'border-transparent text-amber-800/80 hover:text-orange-600 hover:border-orange-300/50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/patients"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all duration-300 ${
                  pathname?.startsWith('/patients')
                    ? 'border-rose-500 text-rose-600 shadow-sm'
                    : 'border-transparent text-amber-800/80 hover:text-rose-600 hover:border-rose-300/50'
                }`}
              >
                Patients
              </Link>
              <Link
                href="/alerts"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all duration-300 ${
                  isActive('/alerts')
                    ? 'border-violet-500 text-violet-600 shadow-sm'
                    : 'border-transparent text-amber-800/80 hover:text-violet-600 hover:border-violet-300/50'
                }`}
              >
                Alerts
              </Link>
              <Link
                href="/hardware"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all duration-300 ${
                  isActive('/hardware')
                    ? 'border-orange-500 text-orange-600 shadow-sm'
                    : 'border-transparent text-amber-800/80 hover:text-orange-600 hover:border-orange-300/50'
                }`}
              >
                Hardware
              </Link>
              <Link
                href="/settings"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all duration-300 ${
                  isActive('/settings')
                    ? 'border-violet-500 text-violet-600 shadow-sm'
                    : 'border-transparent text-amber-800/80 hover:text-violet-600 hover:border-violet-300/50'
                }`}
              >
                Settings
              </Link>
              {admin && (
                <Link
                  href="/admin"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all duration-300 ${
                    isActive('/admin')
                      ? 'border-orange-500 text-orange-600 shadow-sm'
                      : 'border-transparent text-amber-800/80 hover:text-orange-600 hover:border-orange-300/50'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="text-amber-800/80 hover:text-orange-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-orange-50/70 hover:shadow-sm border border-transparent hover:border-orange-200/50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

