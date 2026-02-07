import {defineQuery} from 'next-sanity'

export const POSTS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current)]
    | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      mainImage,
      publishedAt,
      readingTimeMinutes,
      author,
      categories
    }`
)

export const POST_QUERY = defineQuery(
  `*[_type == "post" && slug.current == $slug][0]{
      _id,
      title,
      "slug": slug.current,
      excerpt,
      mainImage,
      publishedAt,
      readingTimeMinutes,
      author,
      categories,
      body,
      seo
    }`
)

export const POST_SLUGS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current)]{
      "slug": slug.current,
      _updatedAt,
      publishedAt
    }`
)
