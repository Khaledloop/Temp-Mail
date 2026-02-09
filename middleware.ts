import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const CANONICAL_HOST = 'tempmaillab.com'
const LEGACY_HOSTS = new Set(['temp-mail-6xq.pages.dev'])

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.toLowerCase() || ''

  if (!host) {
    return NextResponse.next()
  }

  const dashedServiceMatch = request.nextUrl.pathname.match(/^\/temp-mail-for-([a-z0-9-]+)$/i)
  if (dashedServiceMatch) {
    const url = request.nextUrl.clone()
    url.pathname = `/temp-mail-for/${dashedServiceMatch[1]}`
    return NextResponse.redirect(url, 308)
  }

  if (host === `www.${CANONICAL_HOST}` || LEGACY_HOSTS.has(host)) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.hostname = CANONICAL_HOST
    return NextResponse.redirect(url, 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
