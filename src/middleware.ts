import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isValidToken } from '@/lib/tokens'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /depot/[token]
  if (pathname.startsWith('/depot/')) {
    const token = pathname.split('/')[2]
    if (!token || !isValidToken('depot', token)) {
      return NextResponse.notFound()
    }
  }

  // /galerie/[token]
  if (pathname.startsWith('/galerie/')) {
    const token = pathname.split('/')[2]
    if (!token || !isValidToken('galerie', token)) {
      return NextResponse.notFound()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/depot/:path*', '/galerie/:path*'],
}