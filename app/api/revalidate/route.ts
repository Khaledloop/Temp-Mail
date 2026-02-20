import {NextRequest, NextResponse} from 'next/server'
import {revalidatePath} from 'next/cache'

export const runtime = 'edge'

const SECRET = process.env.SANITY_WEBHOOK_SECRET || ''

function isAuthorized(request: NextRequest): boolean {
  if (!SECRET) return false
  const urlSecret = request.nextUrl.searchParams.get('secret')
  if (urlSecret && urlSecret === SECRET) return true
  const headerSecret = request.headers.get('x-sanity-secret')
  if (headerSecret && headerSecret === SECRET) return true
  return false
}

function extractSlug(payload: any): string | null {
  if (!payload) return null
  return (
    payload?.slug?.current ||
    payload?.document?.slug?.current ||
    payload?.slug ||
    payload?.document?.slug ||
    payload?.result?.slug?.current ||
    payload?.result?.slug ||
    null
  )
}

async function handleRevalidate(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401})
  }

  let payload: unknown = null
  try {
    payload = await request.json()
  } catch {
    payload = null
  }

  const slug = extractSlug(payload)

  // Path-based invalidation (primary for compatibility)
  revalidatePath('/blog')
  revalidatePath('/sitemap.xml')
  if (slug) {
    revalidatePath(`/blog/${slug}`)
  }

  return NextResponse.json({ok: true, slug: slug || null})
}

export async function POST(request: NextRequest) {
  return handleRevalidate(request)
}

export async function GET(request: NextRequest) {
  return handleRevalidate(request)
}
