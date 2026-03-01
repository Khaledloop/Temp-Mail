import { MetadataRoute } from 'next'

export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com')
    .replace(/\/+$/, '')

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: ['Googlebot', 'Bingbot', 'DuckDuckBot'],
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'CCBot', 'Google-Extended'],
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`],
  }
}
