import {notFound} from 'next/navigation'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export default function StudioPage() {
  // Studio is intentionally disabled on Pages to keep the Worker under 3 MiB.
  // Host Studio separately (or swap this file) when you need it.
  notFound()
}
