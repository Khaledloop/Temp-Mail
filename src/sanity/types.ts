import type {Image} from 'sanity'
import type {PortableTextBlock} from '@portabletext/types'

export type BlogPostListItem = {
  _id: string
  _updatedAt?: string
  title: string
  slug: string
  excerpt: string
  mainImage?: Image
  publishedAt: string
  readingTimeMinutes?: number
  author?: string
  categories?: string[]
}

export type BlogPost = BlogPostListItem & {
  body: PortableTextBlock[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    canonicalUrl?: string
    openGraphImage?: Image
    noIndex?: boolean
  }
}
