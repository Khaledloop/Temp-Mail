import {defineQuery} from 'next-sanity'

export const POSTS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current) && defined(publishedAt) && !(_id in path("drafts.**")) && (!defined(seo.noIndex) || seo.noIndex != true)]
    | order(publishedAt desc) {
      _id,
      _updatedAt,
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
  `*[_type == "post" && slug.current == $slug && defined(publishedAt) && !(_id in path("drafts.**"))][0]{
      _id,
      _updatedAt,
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
  `*[_type == "post" && defined(slug.current) && defined(publishedAt) && !(_id in path("drafts.**")) && (!defined(seo.noIndex) || seo.noIndex != true)]{
      "slug": slug.current,
      _updatedAt,
      publishedAt
    }`
)
