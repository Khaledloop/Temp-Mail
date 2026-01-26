import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Temp Mail - Your Temporary Email Address',
  description: 'Instantly generate a free, secure, and anonymous temporary email address to protect your privacy online.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}