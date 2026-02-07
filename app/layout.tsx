import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import { JsonLd } from '@/components/seo/JsonLd'
import { ThemeClient } from '@/components/theme/ThemeClient'
import { Footer } from '@/components/common/Footer'

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
})

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com')
  .replace(/\/+$/, '')
const apiOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL
  if (!raw) return ''
  try {
    return new URL(raw).origin
  } catch {
    return ''
  }
})()

export const metadata: Metadata = {
  title: 'Temp Mail - Your Temporary Email Address',
  description: 'Instantly generate a free, secure, and anonymous temporary email address to protect your privacy online. No signup required. Privacy-focused disposable email.',
  metadataBase: new URL(baseUrl),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Temp Mail',
    title: 'Temp Mail - Your Temporary Email Address',
    description:
      'Instantly generate a free, secure, and anonymous temporary email address to protect your privacy online. No signup required.',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Temp Mail - Temporary Email Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Temp Mail - Your Temporary Email Address',
    description:
      'Instantly generate a free, secure, and anonymous temporary email address to protect your privacy online.',
    images: [`${baseUrl}/twitter-image.png`],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <JsonLd />
        {apiOrigin ? (
          <>
            <link rel="preconnect" href={apiOrigin} crossOrigin="" />
            <link rel="dns-prefetch" href={apiOrigin} />
          </>
        ) : null}
      </head>
      <body className={manrope.className}>
        <ThemeClient />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
