import { NextResponse } from 'next/server'

const ADMIN_PATHS = ['/admin', '/admin/login']
const PUBLIC_PATHS = ['/api/auth', '/admin/login']

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Permitir acceso a rutas de auth y login
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Proteger rutas de /admin
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('__secure-nextauth.session-token')?.value
      || request.cookies.get('nextauth.session-token')?.value

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
