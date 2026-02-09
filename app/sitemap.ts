import {MetadataRoute} from 'next'

import {SEO_SERVICES} from '@/utils/constants'
import {client} from '@/sanity/lib/client'
import {POST_SLUGS_QUERY} from '@/sanity/lib/queries'

export const dynamic = 'force-static'

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

  const serviceEntries: MetadataRoute.Sitemap = SEO_SERVICES.map((service) => ({
    url: `${baseUrl}/temp-mail-for/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const posts = await client.fetch<PostSlugEntry[]>(POST_SLUGS_QUERY, {}, {cache: 'force-cache'})

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post._updatedAt || post.publishedAt || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...blogEntries,
    ...serviceEntries,
  ]
}
