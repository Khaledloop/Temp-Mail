import {MetadataRoute} from 'next'

import {sanityFetch} from '@/sanity/lib/client'
import {POST_SLUGS_QUERY} from '@/sanity/lib/queries'

export const revalidate = 600

type PostSlugEntry = {
  slug: string
  _updatedAt?: string
  publishedAt?: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com').replace(
    /\/+$/,
    ''
  )
  const now = new Date()

  const posts = await sanityFetch<PostSlugEntry[]>({
    query: POST_SLUGS_QUERY,
    revalidate: 3600,
    tags: ['post'],
  })
  const latestPostDate =
    posts.length > 0
      ? new Date(
          posts.reduce((latest, post) => {
            const value = post._updatedAt || post.publishedAt || ''
            return value > latest ? value : latest
          }, '')
        )
      : now

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
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
