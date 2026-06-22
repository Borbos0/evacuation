import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, type SessionData } from '@/server/auth/session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/offline' ||
    pathname === '/manifest.webmanifest' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/vehicles/')
  ) {
    return NextResponse.next()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getIronSession<SessionData>(request.cookies as any, sessionOptions)

  if (!session.userId) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      )
    }
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
