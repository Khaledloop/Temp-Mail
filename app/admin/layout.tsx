import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Console | Temp Mail',
  description: 'Secure operations console for Temp Mail',
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
