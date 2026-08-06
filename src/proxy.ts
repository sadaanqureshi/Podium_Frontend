// src/proxy.ts — role-based portal gate for admin / teacher / student
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  sub?: string;
  role_name?: string;
  roleName?: string;
  role?: string;
  exp?: number;
}

function roleFromJwt(token: string): string | null {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const raw = decoded.role_name || decoded.roleName || decoded.role || '';
    const role = String(raw).toLowerCase().trim();
    if (!role) return null;
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return 'expired';
    }
    return role;
  } catch {
    return null;
  }
}

function dashboardFor(role: string) {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'teacher') return '/teacher/dashboard';
  return '/student/dashboard';
}

function signinFor(portal: string) {
  if (portal === 'admin') return '/admin/signin';
  if (portal === 'teacher') return '/teacher/signin';
  return '/student/signin';
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.includes('/signin') || pathname.includes('/signup');
  const portal = pathname.startsWith('/admin')
    ? 'admin'
    : pathname.startsWith('/teacher')
      ? 'teacher'
      : pathname.startsWith('/student')
        ? 'student'
        : null;

  const isProtectedRoute = !!portal && !isAuthPage;

  let actualRole: string | null = null;
  let isTokenExpired = false;

  if (token) {
    const decodedRole = roleFromJwt(token);
    if (decodedRole === 'expired') {
      isTokenExpired = true;
      actualRole = null;
    } else {
      actualRole = decodedRole;
    }
  }

  if (isTokenExpired && isProtectedRoute) {
    const response = NextResponse.redirect(new URL(signinFor(portal!), request.url));
    response.cookies.delete('authToken');
    response.cookies.delete('userRole');
    return response;
  }

  // Logged-in user on a sign-in page → their own dashboard only
  if (actualRole && isAuthPage) {
    return NextResponse.redirect(new URL(dashboardFor(actualRole), request.url));
  }

  // Portal must match JWT role
  if (actualRole && isProtectedRoute && portal) {
    if (actualRole !== portal) {
      return NextResponse.redirect(new URL(dashboardFor(actualRole), request.url));
    }
  }

  // No valid token on protected route → portal sign-in
  if (!actualRole && isProtectedRoute && portal) {
    return NextResponse.redirect(new URL(signinFor(portal), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/student/:path*',
    '/admin/:path*',
    '/teacher/:path*',
  ],
};
