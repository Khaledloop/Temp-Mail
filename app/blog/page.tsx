import Image from 'next/image'
import Link from 'next/link'
import type {Metadata} from 'next'

import {sanityFetch} from '@/sanity/lib/client'
import {POSTS_QUERY} from '@/sanity/lib/queries'
import {urlForImage} from '@/sanity/lib/image'
import type {BlogPostListItem} from '@/sanity/types'

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com').replace(
  /\/+$/,
  ''
)

export const revalidate = 600

export const metadata: Metadata = {
  title: 'Blog - Temp Mail Lab',
  description: 'Actionable guides, updates, and privacy insights for temporary email users.',
  keywords: [
    'temp mail blog',
    'temporary email guides',
    'disposable email privacy',
    'avoid spam email',
    'email privacy tips',
  ],
  alternates: {
    canonical: `${baseUrl}/blog`,
    types: {
      'application/rss+xml': `${baseUrl}/blog/rss.xml`,
    },
  },
  openGraph: {
    title: 'Blog - Temp Mail Lab',
    description: 'Actionable guides, updates, and privacy insights for temporary email users.',
    url: `${baseUrl}/blog`,
    type: 'website',
    images: [
      {
        url: `${baseUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Temp Mail Lab Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Temp Mail Lab',
    description: 'Actionable guides, updates, and privacy insights for temporary email users.',
    images: [`${baseUrl}/twitter-image`],
  },
}

export default async function BlogPage() {
  let posts: BlogPostListItem[] = []
  let hasError = false
  try {
    posts = await sanityFetch<BlogPostListItem[]>({
      query: POSTS_QUERY,
      revalidate: 600,
      tags: ['post'],
    })
  } catch (error) {
    console.error('Failed to load blog posts:', error)
    hasError = true
  }

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-black tracking-[0.3em] text-gray-500 uppercase">
              Temp Mail Lab Journal
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
              Blog
            </h1>
            <p className="mt-4 text-gray-600 text-base max-w-2xl">
              Practical guidance on disposable email, privacy, and staying safe online.
            </p>
          </div>
          <Link
            href="/"
            prefetch={false}
            className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white"
          >
            Back to Home
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-sm font-semibold text-gray-700">
              {hasError ? 'Blog is temporarily unavailable' : 'No posts yet'}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              {hasError
                ? 'Please refresh the page in a moment.'
                : 'Publish your first article in Sanity Studio to see it here.'}
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, index) => {
              const isPriority = index === 0
              const imageUrl = post.mainImage
                ? urlForImage(post.mainImage)
                    .width(560)
                    .height(336)
                    .fit('crop')
                    .quality(52)
                    .format('webp')
                    .auto('format')
                    .url()
                : null
              const blurDataUrl = post.mainImage
                ? urlForImage(post.mainImage)
                    .width(24)
                    .height(14)
                    .fit('crop')
                    .blur(30)
                    .format('webp')
                    .auto('format')
                    .url()
                : undefined

              return (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  prefetch={false}
                  className="group block rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
                  aria-label={`Read ${post.title}`}
                >
                  {imageUrl ? (
                    <div className="overflow-hidden rounded-2xl bg-gray-100">
                      <Image
                        src={imageUrl}
                        alt={post.title}
                        width={560}
                        height={336}
                        unoptimized
                        quality={52}
                        priority={isPriority}
                        loading={isPriority ? 'eager' : 'lazy'}
                        fetchPriority={isPriority ? 'high' : 'auto'}
                        placeholder={blurDataUrl ? 'blur' : 'empty'}
                        blurDataURL={blurDataUrl}
                        className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                        sizes="(min-width: 1536px) 22vw, (min-width: 1280px) 26vw, (min-width: 1024px) 30vw, (min-width: 768px) 44vw, 94vw"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full rounded-2xl bg-gray-100" />
                  )}
                  <div className="mt-5 flex items-center gap-3 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    {post.publishedAt ? (
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    ) : null}
                    {post.readingTimeMinutes ? (
                      <span>{post.readingTimeMinutes} min read</span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-xl font-black text-gray-900 transition group-hover:text-gray-700">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{post.excerpt}</p>
                  <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
                    <span className="font-semibold">{post.author || 'Temp Mail Lab'}</span>
                    <span className="font-semibold uppercase tracking-widest">Read</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
