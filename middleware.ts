import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const CANONICAL_HOST = 'tempmaillab.com'
const LEGACY_HOSTS = new Set(['temp-mail-6xq.pages.dev'])
const MAX_PATH_LENGTH = 2048
const MAX_QUERY_LENGTH = 4096
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const API_ORIGIN = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (!raw) return 'https://api.narsub.shop'
  try {
    return new URL(raw).origin
  } catch {
    return 'https://api.narsub.shop'
  }
})()

const VIGNETTE_ORIGIN = (() => {
  if (process.env.NEXT_PUBLIC_ENABLE_VIGNETTE !== 'true') return ''
  const raw = process.env.NEXT_PUBLIC_VIGNETTE_SRC?.trim()
  if (!raw) return ''
  try {
    return new URL(raw).origin
  } catch {
    return ''
  }
})()
const MONETAG_ORIGIN = 'https://nap5k.com'

const CONNECT_SRC = [
  "'self'",
  'https://www.google-analytics.com',
  'https://region1.google-analytics.com',
  'https://stats.g.doubleclick.net',
  'https://pagead2.googlesyndication.com',
  'https://www.googletagmanager.com',
  'https://cloudflareinsights.com',
  'https://*.api.sanity.io',
  'https://cdn.sanity.io',
  ...(!IS_PRODUCTION
    ? ['http://localhost:*', 'http://127.0.0.1:*', 'ws://localhost:*', 'ws://127.0.0.1:*']
    : []),
  ...(VIGNETTE_ORIGIN ? [VIGNETTE_ORIGIN] : []),
  MONETAG_ORIGIN,
  API_ORIGIN,
]

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${IS_PRODUCTION ? '' : " 'unsafe-eval'"} https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.googletagservices.com https://adservice.google.com https://securepubads.g.doubleclick.net https://static.cloudflareinsights.com${VIGNETTE_ORIGIN ? ` ${VIGNETTE_ORIGIN}` : ''} ${MONETAG_ORIGIN}`,
  `connect-src ${CONNECT_SRC.join(' ')}`,
  "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com",
  "form-action 'self'",
  ...(IS_PRODUCTION ? ['upgrade-insecure-requests'] : []),
].join('; ')

const SECURITY_HEADERS = {
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-DNS-Prefetch-Control': 'off',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Origin-Agent-Cluster': '?1',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
} as const

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  return response
}

export function middleware(request: NextRequest) {
  const hostHeader = request.headers.get('host')?.toLowerCase() || ''
  const host = hostHeader.split(':')[0] || ''

  if (
    request.nextUrl.pathname.length > MAX_PATH_LENGTH ||
    request.nextUrl.search.length > MAX_QUERY_LENGTH
  ) {
    return applySecurityHeaders(
      new NextResponse('Request URI too long', {status: 414})
    )
  }

  if (!host) {
    return applySecurityHeaders(NextResponse.next())
  }

  if (host === `www.${CANONICAL_HOST}` || LEGACY_HOSTS.has(host)) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.hostname = CANONICAL_HOST
    return applySecurityHeaders(NextResponse.redirect(url, 308))
  }

  return applySecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: '/:path*',
}
