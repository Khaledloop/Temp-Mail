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
}

export async function sanityFetch<TResponse, TParams extends QueryParams = QueryParams>(
  options: SanityFetchOptions<TParams>
): Promise<TResponse> {
  const {query, params, revalidate = 300, tags = []} = options
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
    const response = await fetch(url.toString(), {
      headers: readToken ? {Authorization: `Bearer ${readToken}`} : undefined,
      cache: 'force-cache',
      next: {
        revalidate,
        tags,
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      throw new Error(
        `Sanity fetch failed (${response.status} ${response.statusText}) ${errorBody}`
      )
    }

    const json = (await response.json()) as {result: TResponse}
    return json.result
  } finally {
    clearTimeout(timeoutId)
  }
}
