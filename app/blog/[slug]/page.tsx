import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {PortableText, type PortableTextComponents} from '@portabletext/react'

import {sanityFetch} from '@/sanity/lib/client'
import {POST_QUERY, POST_SLUGS_QUERY} from '@/sanity/lib/queries'
import {urlForImage} from '@/sanity/lib/image'
import type {BlogPost} from '@/sanity/types'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

type PostSlugEntry = {
  slug: string
}

export const revalidate = 600
export const dynamicParams = true

const BRAND_NAME = 'Temp Mail Lab'
const MAX_META_TITLE_LENGTH = 65
const MAX_META_DESCRIPTION_LENGTH = 160
const MIN_META_DESCRIPTION_LENGTH = 120

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com').replace(
  /\/+$/,
  ''
)

function normalizeWhitespace(value: string | undefined | null): string {
  return (value || '').replace(/\s+/g, ' ').trim()
}

function trimAtWordBoundary(value: string, maxLength: number): string {
  const clean = normalizeWhitespace(value)
  if (!clean) return ''
  if (clean.length <= maxLength) return clean

  const sliced = clean.slice(0, maxLength - 1)
  const lastSpace = sliced.lastIndexOf(' ')
  const cutoff = lastSpace > Math.floor(maxLength * 0.55) ? lastSpace : sliced.length
  return `${sliced.slice(0, cutoff).trim()}...`
}

function buildSerpTitle(post: BlogPost): string {
  const preferred = normalizeWhitespace(post.seo?.metaTitle) || normalizeWhitespace(post.title)
  if (!preferred) return `${BRAND_NAME} Blog`

  const withBrand = preferred.toLowerCase().includes(BRAND_NAME.toLowerCase())
    ? preferred
    : `${preferred} | ${BRAND_NAME}`

  return trimAtWordBoundary(withBrand, MAX_META_TITLE_LENGTH)
}

function buildSerpDescription(post: BlogPost): string {
  const preferred = normalizeWhitespace(post.seo?.metaDescription) || normalizeWhitespace(post.excerpt)
  const fallback =
    'Get practical temporary email tips, privacy guidance, and step-by-step workflows from Temp Mail Lab.'

  if (!preferred) return fallback
  if (
    preferred.length >= MIN_META_DESCRIPTION_LENGTH &&
    preferred.length <= MAX_META_DESCRIPTION_LENGTH
  ) {
    return preferred
  }
  if (preferred.length > MAX_META_DESCRIPTION_LENGTH) {
    return trimAtWordBoundary(preferred, MAX_META_DESCRIPTION_LENGTH)
  }

  return trimAtWordBoundary(
    `${preferred} Learn how to protect your inbox and use temporary email safely with Temp Mail Lab.`,
    MAX_META_DESCRIPTION_LENGTH
  )
}

function toAbsoluteCanonical(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  try {
    return new URL(value, `${baseUrl}/`).toString()
  } catch {
    return fallback
  }
}

export async function generateStaticParams() {
  try {
    const posts = await sanityFetch<PostSlugEntry[]>({
      query: POST_SLUGS_QUERY,
      revalidate: 3600,
      tags: ['post'],
    })
    return posts.map((post) => ({slug: post.slug}))
  } catch (error) {
    console.error('Failed to generate static params for blog posts:', error)
    return []
  }
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  if (!resolvedParams?.slug) {
    return {
      title: {absolute: `Post not found | ${BRAND_NAME}`},
    }
  }

  let post: BlogPost | null = null
  try {
    post = await sanityFetch<BlogPost | null>({
      query: POST_QUERY,
      params: {slug: resolvedParams.slug},
      revalidate: 600,
      tags: [`post:${resolvedParams.slug}`, 'post'],
    })
  } catch (error) {
    console.error('Failed to load blog metadata:', error)
  }

  if (!post) {
    return {
      title: {absolute: `Post not found | ${BRAND_NAME}`},
      robots: {index: false, follow: false},
    }
  }

  const title = buildSerpTitle(post)
  const description = buildSerpDescription(post)
  const canonical = toAbsoluteCanonical(
    post.seo?.canonicalUrl,
    `${baseUrl}/blog/${post.slug}`
  )
  const ogImage = post.seo?.openGraphImage || post.mainImage
  const ogUrl = ogImage ? urlForImage(ogImage).width(1200).height(630).fit('crop').url() : null

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: [
      'temporary email',
      'disposable email',
      'email privacy',
      ...(post.categories || []),
    ],
    alternates: {canonical},
    robots: post.seo?.noIndex ? {index: false, follow: false} : {index: true, follow: true},
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      images: ogUrl
        ? [
            {
              url: ogUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [],
    },
    twitter: {
      card: ogUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: ogUrl ? [ogUrl] : undefined,
    },
  }
}

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({value}) => {
      if (!value) return null
      const imageUrl = urlForImage(value)
        .width(900)
        .height(540)
        .fit('max')
        .quality(58)
        .format('webp')
        .auto('format')
        .url()
      const blurDataUrl = urlForImage(value)
        .width(24)
        .height(14)
        .fit('crop')
        .blur(35)
        .format('webp')
        .auto('format')
        .url()
      return (
        <figure className="my-8">
          <div className="overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={imageUrl}
              alt={value.alt || 'Blog image'}
              width={900}
              height={540}
              unoptimized
              quality={58}
              placeholder="blur"
              blurDataURL={blurDataUrl}
              className="h-auto w-full object-cover"
              sizes="(min-width: 1024px) 768px, 100vw"
            />
          </div>
          {value.alt ? (
            <figcaption className="mt-3 text-xs text-gray-500">{value.alt}</figcaption>
          ) : null}
        </figure>
      )
    },
  },
  block: {
    h2: ({children}) => (
      <h2 className="mt-10 text-2xl font-black text-gray-900">{children}</h2>
    ),
    h3: ({children}) => (
      <h3 className="mt-8 text-xl font-black text-gray-900">{children}</h3>
    ),
    blockquote: ({children}) => (
      <blockquote className="border-l-4 border-gray-900/20 pl-4 text-gray-700 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({children}) => <ul className="list-disc pl-6 space-y-2">{children}</ul>,
    number: ({children}) => <ol className="list-decimal pl-6 space-y-2">{children}</ol>,
  },
  marks: {
    link: ({children, value}) => {
      const href = typeof value?.href === 'string' ? value.href : '#'
      const isExternal = href.startsWith('http')
      return (
        <a
          href={href}
          className="font-semibold text-blue-700 underline decoration-blue-500/60 underline-offset-2 transition-colors hover:text-blue-800 dark:text-blue-300 dark:decoration-blue-300/60 dark:hover:text-blue-200"
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      )
    },
  },
}

export default async function BlogPostPage({params}: PageProps) {
  const resolvedParams = await params
  if (!resolvedParams?.slug) {
    notFound()
  }

  let post: BlogPost | null = null
  try {
    post = await sanityFetch<BlogPost | null>({
      query: POST_QUERY,
      params: {slug: resolvedParams.slug},
      revalidate: 600,
      tags: [`post:${resolvedParams.slug}`, 'post'],
    })
  } catch (error) {
    console.error('Failed to load blog post:', error)
  }

  if (!post) {
    notFound()
  }

  const heroImage = post.mainImage
    ? urlForImage(post.mainImage)
        .width(820)
        .height(462)
        .fit('crop')
        .quality(48)
        .format('webp')
        .auto('format')
        .url()
    : null
  const heroBlurImage = post.mainImage
    ? urlForImage(post.mainImage)
        .width(24)
        .height(14)
        .fit('crop')
        .blur(40)
        .format('webp')
        .auto('format')
        .url()
    : null
  const canonical = toAbsoluteCanonical(
    post.seo?.canonicalUrl,
    `${baseUrl}/blog/${post.slug}`
  )
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: heroImage ? [heroImage] : undefined,
    datePublished: post.publishedAt,
    dateModified: post._updatedAt || post.publishedAt,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    articleSection: post.categories || undefined,
    author: post.author ? {'@type': 'Person', name: post.author} : {'@type': 'Organization', name: 'Temp Mail Lab'},
    publisher: {
      '@type': 'Organization',
      name: 'Temp Mail Lab',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icon-192x192.png`,
      },
    },
    mainEntityOfPage: canonical,
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${baseUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonical,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify([articleJsonLd, breadcrumbJsonLd])}}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between flex-wrap gap-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">
          <Link
            href="/blog"
            prefetch={false}
            className="hover:text-gray-900 transition-colors dark:hover:text-white"
          >
            Back to Blog
          </Link>
          <span>Temp Mail Lab Journal</span>
        </div>

        <h1 className="mt-6 text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
          {post.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="font-semibold">{post.author || 'Temp Mail Lab'}</span>
          <span>
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          {post.readingTimeMinutes ? <span>{post.readingTimeMinutes} min read</span> : null}
        </div>

        {heroImage ? (
          <div className="mt-10 overflow-hidden rounded-[2rem] bg-gray-100">
            <Image
              src={heroImage}
              alt={post.title}
              width={820}
              height={462}
              unoptimized
              quality={48}
              placeholder={heroBlurImage ? 'blur' : 'empty'}
              blurDataURL={heroBlurImage || undefined}
              className="h-auto w-full object-cover"
              sizes="(min-width: 1280px) 665px, (min-width: 1024px) 66vw, 94vw"
              priority
            />
          </div>
        ) : null}

        <p className="mt-8 text-lg text-gray-700 leading-relaxed">{post.excerpt}</p>

        <article className="prose prose-lg max-w-none text-gray-700 mt-10 dark:prose-invert dark:text-gray-200">
          <PortableText value={post.body} components={portableTextComponents} />
        </article>

        {post.categories?.length ? (
          <div className="mt-12 flex flex-wrap items-center gap-2">
            {post.categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-600"
              >
                {category}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

