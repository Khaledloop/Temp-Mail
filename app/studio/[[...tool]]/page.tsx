import {notFound} from 'next/navigation'

const studioEnabled = process.env.NEXT_PUBLIC_ENABLE_STUDIO === 'true'

export const dynamic = 'force-static'

export default async function StudioPage() {
  if (studioEnabled) {
    const {default: Studio} = await import('./Studio')
    return <Studio />
  }

  notFound()
}
