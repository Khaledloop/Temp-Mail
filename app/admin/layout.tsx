import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Console | Temp Mail Lab',
  description: 'Secure operations console for Temp Mail Lab',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
