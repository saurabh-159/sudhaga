import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;
  const user = token ? await verifyToken(token) : null;
  const isAdmin = user?.role === 'admin';

  if (pathname === '/login') {
    if (isAdmin) return NextResponse.redirect(new URL('/admin', req.url));
    return NextResponse.next();
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!isAdmin) {
      const res = NextResponse.redirect(new URL('/login', req.url));
      if (token) res.cookies.delete('token');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/login'],
};
