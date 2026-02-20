import {NextResponse} from 'next/server'

import {sanityFetch} from '@/sanity/lib/client'
import {POSTS_QUERY} from '@/sanity/lib/queries'
import type {BlogPostListItem} from '@/sanity/types'

export const dynamic = 'force-static'
export const revalidate = 600

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com').replace(
    /\/+$/,
    ''
  )
  let posts: BlogPostListItem[] = []

  try {
    posts = await sanityFetch<BlogPostListItem[]>({
      query: POSTS_QUERY,
      revalidate: 600,
      tags: ['post'],
    })
  } catch (error) {
    console.error('Failed to load posts for RSS:', error)
  }

  const latestDate =
    posts.length > 0
      ? new Date(
          posts.reduce((latest, post) => {
            const value = post._updatedAt || post.publishedAt
            return value > latest ? value : latest
          }, posts[0]._updatedAt || posts[0].publishedAt)
        ).toUTCString()
      : new Date().toUTCString()

  const items = posts
    .map((post) => {
      const url = `${baseUrl}/blog/${post.slug}`
      const title = escapeXml(post.title)
      const description = escapeXml(post.excerpt || '')
      const pubDate = new Date(post.publishedAt).toUTCString()
      return [
        '<item>',
        `<title>${title}</title>`,
        `<link>${url}</link>`,
        `<guid>${url}</guid>`,
        `<description>${description}</description>`,
        `<pubDate>${pubDate}</pubDate>`,
        '</item>',
      ].join('')
    })
    .join('')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '<channel>',
    '<title>Temp Mail Lab Blog</title>',
    `<link>${baseUrl}/blog</link>`,
    '<description>Guides and insights about temporary email privacy and anti-spam workflows.</description>',
    '<language>en-us</language>',
    `<lastBuildDate>${latestDate}</lastBuildDate>`,
    items,
    '</channel>',
    '</rss>',
  ].join('')

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600',
    },
  })
}
