import 'server-only'

import {createClient, type QueryParams} from 'next-sanity'

import {apiVersion, dataset, projectId, readToken} from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: !readToken,
  token: readToken || undefined,
  // Avoid Cloudflare 524 timeouts when Sanity is slow/unreachable.
  timeout: 8000,
  maxRetries: 1,
})

type SanityFetchOptions<TParams extends QueryParams> = {
  query: string
  params?: TParams
  revalidate?: number
  tags?: string[]
  cache?: RequestCache
}

export async function sanityFetch<TResponse, TParams extends QueryParams = QueryParams>(
  options: SanityFetchOptions<TParams>
): Promise<TResponse> {
  const {query, params, revalidate = 300, tags = [], cache = 'force-cache'} = options
  const resolvedParams = params ?? ({} as TParams)

  const origin = readToken
    ? `https://${projectId}.api.sanity.io`
    : `https://${projectId}.apicdn.sanity.io`
  const url = new URL(`/v${apiVersion}/data/query/${dataset}`, origin)
  url.searchParams.set('query', query)
  Object.entries(resolvedParams).forEach(([key, value]) => {
    if (typeof value === 'undefined') return
    url.searchParams.set(`$${key}`, JSON.stringify(value))
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)
  try {
    const headers = readToken ? {Authorization: `Bearer ${readToken}`} : undefined

    const runFetch = async (
      init: RequestInit & {next?: {revalidate?: number; tags?: string[]}}
    ) => {
      const response = await fetch(url.toString(), init)
      if (!response.ok) {
        const errorBody = await response.text().catch(() => '')
        throw new Error(
          `Sanity fetch failed (${response.status} ${response.statusText}) ${errorBody}`
        )
      }
      const json = (await response.json()) as {result: TResponse}
      return json.result
    }

    // First attempt: use Next.js cache + tags.
    try {
      const useNextCache = cache !== 'no-store'
      return await runFetch({
        headers,
        cache,
        next: useNextCache
          ? {
              revalidate,
              tags,
            }
          : undefined,
        signal: controller.signal,
      })
    } catch (error) {
      // Fallback: retry without Next.js cache hints (better for some edge runtimes).
      console.warn('Sanity fetch failed with cache; retrying without cache.', error)
      return await runFetch({
        headers,
        cache: 'no-store',
        signal: controller.signal,
      })
    }
  } finally {
    clearTimeout(timeoutId)
  }
}
