import {notFound} from 'next/navigation'

const studioEnabled = process.env.NEXT_PUBLIC_ENABLE_STUDIO === 'true'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export default async function StudioPage() {
  if (!studioEnabled) {
    notFound()
  }

  const {default: Studio} = await import('./Studio')
  return <Studio />
}
