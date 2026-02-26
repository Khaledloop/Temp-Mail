import {MetadataRoute} from 'next'

import {sanityFetch} from '@/sanity/lib/client'
import {POST_SLUGS_QUERY} from '@/sanity/lib/queries'

export const revalidate = 600

type PostSlugEntry = {
  slug: string
  _updatedAt?: string
  publishedAt?: string
}

function isValidDate(value: unknown): value is string | number | Date {
  if (!value) return false
  const isDateLike =
    typeof value === 'string' || typeof value === 'number' || value instanceof Date
  if (!isDateLike) return false
  const date = new Date(value)
  return !Number.isNaN(date.getTime())
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com').replace(
    /\/+$/,
    ''
  )
  const now = new Date()

  let posts: PostSlugEntry[] = []
  try {
    posts = await sanityFetch<PostSlugEntry[]>({
      query: POST_SLUGS_QUERY,
      revalidate: 3600,
      tags: ['post'],
    })
  } catch (error) {
    console.error('Failed to load post slugs for sitemap:', error)
  }

  const validPosts = posts.filter(
    (post) => Boolean(post?.slug) && isValidDate(post._updatedAt || post.publishedAt || '')
  )
  const latestPostDate =
    validPosts.length > 0
      ? new Date(
          validPosts.reduce((latest, post) => {
            const value = post._updatedAt || post.publishedAt || ''
            return value > latest ? value : latest
          }, '')
        )
      : now

  const blogEntries: MetadataRoute.Sitemap = validPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post._updatedAt || post.publishedAt || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/tools/password-generator`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/gmail-dot-generator`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.82,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: latestPostDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/rss.xml`,
      lastModified: latestPostDate,
      changeFrequency: 'hourly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...blogEntries,
  ]
}
