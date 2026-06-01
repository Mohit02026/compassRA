import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const role = session?.user?.role

  // Protect /portal/* — CUSTOMER only
  if (pathname.startsWith('/portal')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (role !== 'CUSTOMER') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    // Force password change on first login
    if (
      session.user.mustChangePwd &&
      pathname !== '/portal/account/change-password'
    ) {
      return NextResponse.redirect(
        new URL('/portal/account/change-password', req.url)
      )
    }
  }

  // Protect /ops/* — OPS or ADMIN only (exclude the login page itself)
  if (pathname.startsWith('/ops') && pathname !== '/ops/login') {
    if (!session) {
      return NextResponse.redirect(new URL('/ops/login', req.url))
    }
    if (role !== 'OPS' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/ops/login', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/portal/:path*', '/ops/:path*'],
}
