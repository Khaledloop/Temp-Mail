import Image from 'next/image'
import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {PortableText, type PortableTextComponents} from '@portabletext/react'

import {sanityFetch} from '@/sanity/lib/client'
import {POST_QUERY} from '@/sanity/lib/queries'
import {urlForImage} from '@/sanity/lib/image'
import type {BlogPost} from '@/sanity/types'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com').replace(
  /\/+$/,
  ''
)

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  if (!resolvedParams?.slug) {
    return {
      title: 'Post not found - Temp Mail Lab',
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
      title: 'Blog temporarily unavailable - Temp Mail Lab',
    }
  }

  const title = post.seo?.metaTitle || post.title
  const description = post.seo?.metaDescription || post.excerpt
  const canonical = post.seo?.canonicalUrl || `${baseUrl}/blog/${post.slug}`
  const ogImage = post.seo?.openGraphImage || post.mainImage
  const ogUrl = ogImage ? urlForImage(ogImage).width(1200).height(630).fit('crop').url() : null

  return {
    title,
    description,
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
      const imageUrl = urlForImage(value).width(1200).height(720).fit('max').url()
      return (
        <figure className="my-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={imageUrl}
              alt={value.alt || 'Blog image'}
              fill
              className="object-cover"
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
    return (
      <div className="min-h-screen bg-transparent pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between flex-wrap gap-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">
            <a href="/blog" className="hover:text-gray-900 transition">
              Back to Blog
            </a>
            <span>Temp Mail Lab Journal</span>
          </div>

          <h1 className="mt-6 text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Blog temporarily unavailable
          </h1>

          <p className="mt-6 text-gray-600 text-base">
            We could not load this article right now. Please refresh the page in a moment.
          </p>
        </div>
      </div>
    )
  }

  const heroImage = post.mainImage
    ? urlForImage(post.mainImage).width(1600).height(900).fit('crop').url()
    : null
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: heroImage ? [heroImage] : undefined,
    datePublished: post.publishedAt,
    author: post.author ? { '@type': 'Person', name: post.author } : undefined,
    mainEntityOfPage: `${baseUrl}/blog/${post.slug}`,
  }

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between flex-wrap gap-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">
          <a href="/blog" className="hover:text-gray-900 transition-colors dark:hover:text-white">
            Back to Blog
          </a>
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
          <div className="mt-10 relative aspect-[16/9] overflow-hidden rounded-[2rem] bg-gray-100">
            <Image
              src={heroImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 768px, 100vw"
              priority
            />
          </div>
        ) : null}

        <p className="mt-8 text-lg text-gray-700 leading-relaxed">{post.excerpt}</p>

        <article className="prose prose-lg max-w-none text-gray-700 mt-10">
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
