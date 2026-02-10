import 'server-only'

import {createClient, type QueryParams} from 'next-sanity'

import {apiVersion, dataset, projectId, readToken} from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
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

  return client.fetch<TResponse>(query, resolvedParams, {
    cache: 'force-cache',
    next: {
      revalidate,
      tags,
    },
  })
}
