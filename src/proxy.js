import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const PUBLIC_ADMIN_ROUTES = ['/admin/login'];

export async function proxy(request) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.id);
  const isPublicAdminRoute = PUBLIC_ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublicAdminRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/admin', nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL('/admin/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', `${pathname}${nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};