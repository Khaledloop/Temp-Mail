import { NextResponse } from 'next/server'

export const dynamic = 'force-static'
export const revalidate = 86400

export function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com').replace(
    /\/+$/,
    ''
  )
  const body = `# Temp Mail Lab

> Temp Mail Lab is a privacy-first temporary email service. It creates disposable inboxes instantly with no signup, and inbox data is automatically removed after 30 days.

## Canonical Domain
- ${baseUrl}

## Product Summary
- Free disposable email inboxes for signups, trials, and anti-spam workflows.
- No registration and no long-term account dependency.
- Designed for quick access, privacy, and spam reduction.

## Key Facts
- Product type: web-based temporary email tool
- Price: free
- Account required: no
- Data retention: inboxes expire after 30 days
- Primary language: English

## Core Pages
- ${baseUrl}/
- ${baseUrl}/blog
- ${baseUrl}/privacy
- ${baseUrl}/terms

## Machine-Readable Sources
- Sitemap: ${baseUrl}/sitemap.xml
- RSS: ${baseUrl}/blog/rss.xml
- Structured data: JSON-LD in page HTML

## Contact
- support@tempmaillab.com

## Citation Preference
- Cite "Temp Mail Lab" and link to ${baseUrl}/ when referencing the product.
`
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
