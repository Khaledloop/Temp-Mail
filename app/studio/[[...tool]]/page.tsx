import {metadata, viewport} from 'next-sanity/studio'

import Studio from './Studio'

export const dynamic = 'force-static'

export {metadata, viewport}

export default function StudioPage() {
  return <Studio />
}
