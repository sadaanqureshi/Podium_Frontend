// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const role = request.cookies.get('userRole')?.value?.toLowerCase(); 
  const { pathname } = request.nextUrl;

  // # Updated to include role-based signin paths
  const isAuthPage = pathname.includes('/signin') || pathname.includes('/signup');

  const isProtectedRoute = (
    pathname.startsWith('/student') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/teacher')
  ) && !isAuthPage;

  // Logic 1: Authenticated user trying to access Auth Pages
  if (token && isAuthPage) {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (role === 'teacher') return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
    if (role === 'student') return NextResponse.redirect(new URL('/student/dashboard', request.url));
    return NextResponse.next();
  }

  // Logic 2: Role-Based Protection (Strict Redirects)
  if (token && isProtectedRoute) {
    if (pathname.startsWith('/admin') && role !== 'admin') return NextResponse.redirect(new URL('/student/dashboard', request.url));
    if (pathname.startsWith('/teacher') && role !== 'teacher') return NextResponse.redirect(new URL('/student/dashboard', request.url));
    if (pathname.startsWith('/student') && role !== 'student') {
        const target = role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard';
        return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // Logic 3: Not Logged In? Redirect to role-specific signin
  if (!token && isProtectedRoute) {
    if (pathname.startsWith('/admin')) return NextResponse.redirect(new URL('/admin/signin', request.url));
    if (pathname.startsWith('/teacher')) return NextResponse.redirect(new URL('/teacher/signin', request.url));
    if (pathname.startsWith('/student')) return NextResponse.redirect(new URL('/student/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/admin/:path*', '/teacher/:path*', '/student/signin', '/student/signup', '/admin/signin', '/teacher/signin'],
};