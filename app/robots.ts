import { MetadataRoute } from 'next'

export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin'],
    },
    sitemap: 'https://temp-mail-6xq.pages.dev/sitemap.xml',
  }
}
