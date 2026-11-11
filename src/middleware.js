import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Permitir acceso a la página de login
  if (pathname === '/admin/login') {
    if (session?.user) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // Proteger todas las subrutas de /admin
  if (pathname.startsWith('/admin')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}