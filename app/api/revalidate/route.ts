import {NextRequest, NextResponse} from 'next/server'
import {revalidatePath} from 'next/cache'

export const runtime = 'edge'

const SECRET = process.env.SANITY_WEBHOOK_SECRET || ''
const MAX_BODY_BYTES = 24 * 1024
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 20

type RateLimitEntry = {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

function withNoIndexHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  response.headers.set('Cache-Control', 'no-store')
  return response
}

function jsonResponse(body: Record<string, unknown>, status = 200): NextResponse {
  return withNoIndexHeaders(NextResponse.json(body, {status}))
}

function secureCompare(expected: string, received: string): boolean {
  let mismatch = expected.length === received.length ? 0 : 1
  const maxLength = Math.max(expected.length, received.length)

  for (let i = 0; i < maxLength; i += 1) {
    const expectedCode = i < expected.length ? expected.charCodeAt(i) : 0
    const receivedCode = i < received.length ? received.charCodeAt(i) : 0
    mismatch |= expectedCode ^ receivedCode
  }

  return mismatch === 0
}

function getProvidedSecret(request: NextRequest): string | null {
  const headerSecret = request.headers.get('x-sanity-secret')?.trim()
  if (headerSecret) return headerSecret

  const authorization = request.headers.get('authorization')?.trim()
  if (authorization?.toLowerCase().startsWith('bearer ')) {
    const token = authorization.slice(7).trim()
    if (token) return token
  }

  return null
}

function isAuthorized(request: NextRequest): boolean {
  if (!SECRET) {
    return false
  }

  const provided = getProvidedSecret(request)
  if (!provided) {
    return false
  }

  if (!secureCompare(SECRET, provided)) {
    return false
  }

  return true
}

function getClientIp(request: NextRequest): string {
  const cfConnectingIp = request.headers.get('cf-connecting-ip')?.trim()
  if (cfConnectingIp) return cfConnectingIp

  const forwardedFor = request.headers.get('x-forwarded-for')?.trim()
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim()
    if (firstIp) return firstIp
  }

  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  return 'unknown'
}

function pruneRateLimitStore(now: number): void {
  if (rateLimitStore.size < 2048) {
    return
  }

  rateLimitStore.forEach((value, key) => {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key)
    }
  })
}

function consumeRateLimit(ip: string): {allowed: boolean; retryAfter: number} {
  const now = Date.now()
  pruneRateLimitStore(now)

  const existing = rateLimitStore.get(ip)
  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })
    return {allowed: true, retryAfter: 0}
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    return {allowed: false, retryAfter}
  }

  existing.count += 1
  rateLimitStore.set(ip, existing)
  return {allowed: true, retryAfter: 0}
}

function normalizeSlug(value: string): string | null {
  const slug = value.trim().toLowerCase()
  if (!slug) return null
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : null
}

function extractSlugValue(source: unknown): string | null {
  if (typeof source === 'string') {
    return normalizeSlug(source)
  }

  if (typeof source !== 'object' || source === null) {
    return null
  }

  const record = source as Record<string, unknown>
  if (typeof record.current === 'string') {
    return normalizeSlug(record.current)
  }

  return null
}

function extractSlug(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) {
    return null
  }

  const record = payload as Record<string, unknown>
  const slugCandidates = [
    record.slug,
    (record.document as Record<string, unknown> | undefined)?.slug,
    (record.result as Record<string, unknown> | undefined)?.slug,
  ]

  for (const candidate of slugCandidates) {
    const resolved = extractSlugValue(candidate)
    if (resolved) {
      return resolved
    }
  }

  return null
}

function exceedsBodyLimit(request: NextRequest): boolean {
  const contentLength = request.headers.get('content-length')
  if (!contentLength) {
    return false
  }

  const parsedLength = Number(contentLength)
  if (!Number.isFinite(parsedLength) || parsedLength <= 0) {
    return false
  }

  return parsedLength > MAX_BODY_BYTES
}

async function handleRevalidate(request: NextRequest) {
  if (request.headers.get('content-type')?.toLowerCase().includes('application/json') !== true) {
    return jsonResponse({ok: false, error: 'Unsupported Media Type'}, 415)
  }

  if (exceedsBodyLimit(request)) {
    return jsonResponse({ok: false, error: 'Payload too large'}, 413)
  }

  const clientIp = getClientIp(request)
  const rateLimit = consumeRateLimit(clientIp)
  if (!rateLimit.allowed) {
    const response = jsonResponse({ok: false, error: 'Too many requests'}, 429)
    response.headers.set('Retry-After', String(rateLimit.retryAfter))
    return response
  }

  if (!isAuthorized(request)) {
    return jsonResponse({ok: false, error: 'Unauthorized'}, 401)
  }

  let payload: unknown = null
  try {
    payload = await request.json()
  } catch {
    return jsonResponse({ok: false, error: 'Invalid JSON body'}, 400)
  }

  const slug = extractSlug(payload)

  // Path-based invalidation (primary for compatibility)
  revalidatePath('/blog')
  revalidatePath('/sitemap.xml')
  if (slug) {
    revalidatePath(`/blog/${slug}`)
  }

  return jsonResponse({ok: true, slug: slug || null})
}

export async function POST(request: NextRequest) {
  return handleRevalidate(request)
}
