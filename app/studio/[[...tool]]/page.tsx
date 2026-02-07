import {notFound} from 'next/navigation'

const studioEnabled = process.env.NEXT_PUBLIC_ENABLE_STUDIO === 'true'

export const dynamic = studioEnabled ? 'force-dynamic' : 'force-static'

export default async function StudioPage() {
  if (!studioEnabled) {
    notFound()
  }

  const {default: Studio} = await import('./Studio')
  return <Studio />
}
