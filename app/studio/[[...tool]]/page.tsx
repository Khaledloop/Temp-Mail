import {metadata, viewport} from 'next-sanity/studio'

import Studio from './Studio'

export const dynamic = 'force-static'
export const runtime = 'edge'

export {metadata, viewport}

export default function StudioPage() {
  return <Studio />
}
