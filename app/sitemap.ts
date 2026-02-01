import { MetadataRoute } from 'next'
import { SEO_SERVICES } from '@/utils/constants'

export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://temp-mail-6xq.pages.dev')
    .replace(/\/+$/, '')

  const serviceEntries: MetadataRoute.Sitemap = SEO_SERVICES.map((service) => ({
    url: `${baseUrl}/temp-mail-for-${service.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
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
    ...serviceEntries,
  ]
}
