import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export function GET() {
  const body = `# Temp Mail Lab

> Temp Mail Lab is a fast, privacy-first temporary email service that lets users generate disposable inboxes in seconds. Emails and addresses expire after 30 days.

## Primary Site
- https://tempmaillab.com/

## Key Pages
- https://tempmaillab.com/
- https://tempmaillab.com/blog
- https://tempmaillab.com/privacy
- https://tempmaillab.com/terms

## Sitemap
- https://tempmaillab.com/sitemap.xml

## Contact
- support@tempmaillab.com
`
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
