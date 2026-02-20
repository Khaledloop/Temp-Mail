import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const CANONICAL_HOST = 'tempmaillab.com'
const LEGACY_HOSTS = new Set(['temp-mail-6xq.pages.dev'])

export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.toLowerCase() || ''

  if (!host) {
    return NextResponse.next()
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
