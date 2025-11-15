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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setAdmin(isAdmin());
  }, [pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
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

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', active: isActive('/dashboard') },
    { href: '/patients', label: 'Patients', active: pathname?.startsWith('/patients') },
    { href: '/alerts', label: 'Alerts', active: isActive('/alerts') },
    { href: '/hardware', label: 'Hardware', active: isActive('/hardware') },
    { href: '/settings', label: 'Settings', active: isActive('/settings') },
    ...(admin ? [{ href: '/admin', label: 'Admin', active: isActive('/admin') }] : []),
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-xl shadow-md border-b border-orange-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/logo.png"
                alt="CareSure Logo"
                width={40}
                height={40}
                className="object-contain w-8 h-8 sm:w-10 sm:h-10"
              />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 via-rose-500 to-violet-600 bg-clip-text text-transparent drop-shadow-sm">
                CareSure
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:ml-6 md:flex md:space-x-4 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center px-2 lg:px-3 pt-1 border-b-2 text-sm font-semibold transition-all duration-300 min-h-[44px] ${
                  link.active
                    ? 'border-orange-500 text-orange-600 shadow-sm'
                    : 'border-transparent text-amber-800/80 hover:text-orange-600 hover:border-orange-300/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Logout */}
          <div className="hidden md:flex items-center">
            <button
              onClick={handleLogout}
              className="text-amber-800/80 hover:text-orange-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-orange-50/70 hover:shadow-sm border border-transparent hover:border-orange-200/50 min-h-[44px]"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-amber-800/80 hover:text-orange-600 hover:bg-orange-50/70 focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[44px] min-h-[44px]"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-orange-200/60 bg-white/95 backdrop-blur-xl">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-3 rounded-lg text-base font-semibold transition-all duration-300 min-h-[44px] flex items-center ${
                  link.active
                    ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-500'
                    : 'text-amber-800/80 hover:bg-orange-50/50 hover:text-orange-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-3 rounded-lg text-base font-semibold text-amber-800/80 hover:bg-orange-50/50 hover:text-orange-600 transition-all duration-300 min-h-[44px] flex items-center"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
