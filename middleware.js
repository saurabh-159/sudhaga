import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { productionOrigin } from '@/lib/site';

function hostRedirect(req) {
  if (process.env.VERCEL_ENV !== 'production') return null;
  const host = (req.headers.get('host') || '').toLowerCase();
  if (!host || host.startsWith('localhost') || host.startsWith('127.0.0.1')) return null;
  const target = productionOrigin();
  if (!target || host === target.host) return null;
  const url = req.nextUrl.clone();
  url.protocol = target.protocol;
  url.host = target.host;
  return NextResponse.redirect(url, 308);
}

export async function middleware(req) {
  const redirect = hostRedirect(req);
  if (redirect) return redirect;

  const { pathname } = req.nextUrl;
  const needsAuth = pathname === '/login' || pathname === '/admin' || pathname.startsWith('/admin/');
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get('token')?.value;
  const user = token ? await verifyToken(token) : null;
  const isAdmin = user?.role === 'admin';

  if (pathname === '/login') {
    if (isAdmin) return NextResponse.redirect(new URL('/admin', req.url));
    return NextResponse.next();
  }

  if (!isAdmin) {
    const res = NextResponse.redirect(new URL('/login', req.url));
    if (token) res.cookies.delete('token');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
