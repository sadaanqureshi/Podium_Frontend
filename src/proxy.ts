// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// JWT payload ka interface jo hum expect kar rahe hain
interface JWTPayload {
  sub: string;
  role_name: string; // Backend se yahi key aa rahi hai aapke JSON mein
  exp: number;
}

export function proxy (request: NextRequest) {
  // 1. Sirf ek chiz par bharosa karna hai: Auth Token (JWT)
  const token = request.cookies.get('authToken')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.includes('/signin') || pathname.includes('/signup');
  const isProtectedRoute = (
    pathname.startsWith('/student') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/teacher')
  ) && !isAuthPage;

  let actualRole: string | null = null;
  let isTokenExpired = false;

  // 2. Token ko Decode kar ke Asli Role nikalna
  if (token) {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      actualRole = decoded.role_name.toLowerCase(); // Role hamesha JWT se aayega
      
      // Token expiry check karna (optional but recommended)
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        isTokenExpired = true;
      }
    } catch (error) {
      console.error("Invalid JWT Token in Middleware:", error);
      // Agar token fake ya kharab hai, toh pretend karo ke user logged out hai
      actualRole = null; 
    }
  }

  // Agar token expire ho gaya hai, toh user ko signin par wapas bhej do
  if (isTokenExpired && isProtectedRoute) {
    const response = NextResponse.redirect(new URL(`/${pathname.split('/')[1]}/signin`, request.url));
    response.cookies.delete('authToken'); // Expired cookie delete kar do
    return response;
  }

  // --- LOGIC 1: User Logged In Hai aur Signin page par jana chahta hai ---
  if (actualRole && isAuthPage) {
    if (actualRole === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (actualRole === 'teacher') return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
    if (actualRole === 'student') return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }

  // --- LOGIC 2: Strict Role Verification (The Real Bouncer) ---
  if (actualRole && isProtectedRoute) {
    if (pathname.startsWith('/admin') && actualRole !== 'admin') return NextResponse.redirect(new URL('/student/dashboard', request.url));
    if (pathname.startsWith('/teacher') && actualRole !== 'teacher') return NextResponse.redirect(new URL('/student/dashboard', request.url));
    if (pathname.startsWith('/student') && actualRole !== 'student') {
        const target = actualRole === 'admin' ? '/admin/dashboard' : '/teacher/dashboard';
        return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // --- LOGIC 3: User Logged In nahi hai (Ya token invalid tha) ---
  if (!actualRole && isProtectedRoute) {
    if (pathname.startsWith('/admin')) return NextResponse.redirect(new URL('/admin/signin', request.url));
    if (pathname.startsWith('/teacher')) return NextResponse.redirect(new URL('/teacher/signin', request.url));
    if (pathname.startsWith('/student')) return NextResponse.redirect(new URL('/student/signin', request.url));
  }

  // Sab sahi hai, aage jane do
  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/admin/:path*', '/teacher/:path*', '/student/signin', '/student/signup', '/admin/signin', '/teacher/signin'],
};