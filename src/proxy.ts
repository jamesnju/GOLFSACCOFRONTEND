import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Manually check for the session cookie
  const sessionCookie = request.cookies.get('next-auth.session-token');
  const isAuthenticated = !!sessionCookie;

  console.log('Proxy - Path:', path);
  console.log('Proxy - Has session cookie:', !!sessionCookie);

  // Public routes
  const publicRoutes = ['/login', '/register', '/payment', '/payment/success'];
  
  // If path is public
  if (publicRoutes.some(route => path.startsWith(route))) {
    // If authenticated and trying to access public routes, redirect to dashboard
    if (isAuthenticated) {
      console.log('Proxy - Authenticated on public route, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    console.log('Proxy - Public route, allowing access');
    return NextResponse.next();
  }

  // Protected routes - redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('Proxy - No session cookie, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  console.log('Proxy - Allowing access to:', path);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/player/:path*',
    '/pro/:path*',
    '/caddy/:path*',
    '/wallet/:path*',
    '/loans/:path*',
    '/transactions/:path*',
    '/settings/:path*',
    '/login',
    '/register',
    '/payment/:path*',
  ],
};