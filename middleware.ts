import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/patients',
  '/alerts',
  '/settings',
  '/about',
  '/create-profile',
  '/hardware',
];

// Public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(pathname) || pathname === '/';
  
  // IMPORTANT: Since we use localStorage for tokens (client-side only),
  // the middleware cannot check authentication on the server side.
  // AuthGuard component handles all authentication checks client-side.
  // 
  // The middleware only handles:
  // 1. Setting redirect parameter for protected routes (optional, for better UX)
  // 2. Allowing all requests through - AuthGuard will handle redirects
  
  // For protected routes, we could add a redirect parameter for better UX,
  // but we don't block access here since we can't check localStorage
  // The AuthGuard component will handle the actual authentication check
  
  // Allow all requests - AuthGuard will handle authentication on client side
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

