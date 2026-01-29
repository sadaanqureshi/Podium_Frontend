import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const role = request.cookies.get('userRole')?.value?.toLowerCase(); 
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.includes('signin') || pathname.includes('signup');

  const isProtectedRoute = (
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/teacher')
  ) && !isAuthPage;

  // --- LOGIC 1: Authenticated user trying to access Auth Pages ---
  if (token && isAuthPage) {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (role === 'teacher') return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
    if (role === 'student') return NextResponse.redirect(new URL('/dashboard', request.url));
    
    // Agar role nahi mila to redirect na karein balkay session clear hone dein
    return NextResponse.next();
  }

  // --- LOGIC 2: Role-Based Protection ---
  if (token && isProtectedRoute) {
    if (pathname.startsWith('/admin') && role !== 'admin') return NextResponse.redirect(new URL('/dashboard', request.url));
    if (pathname.startsWith('/teacher') && role !== 'teacher') return NextResponse.redirect(new URL('/dashboard', request.url));
    if (pathname.startsWith('/dashboard') && role !== 'student') {
        // Agar admin galti se student dashboard pe jaye to usay uske sahi ghar bhejo
        const target = role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard';
        return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // --- LOGIC 3: Not Logged In? Redirect to specific signin ---
  if (!token && isProtectedRoute) {
    if (pathname.startsWith('/admin')) return NextResponse.redirect(new URL('/admin/signin', request.url));
    if (pathname.startsWith('/teacher')) return NextResponse.redirect(new URL('/teacher/signin', request.url));
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/teacher/:path*', '/signin', '/signup', '/auth/:path*'],
};