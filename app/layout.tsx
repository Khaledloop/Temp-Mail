import type { Metadata } from 'next'
import './globals.css'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Temp Mail - Your Temporary Email Address',
  description: 'Instantly generate a free, secure, and anonymous temporary email address to protect your privacy online. No signup required. Privacy-focused disposable email.',
  metadataBase: new URL('https://tempmail.pages.dev'),
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
    canonical: 'https://tempmail.pages.dev',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tempmail.pages.dev',
    siteName: 'Temp Mail',
    title: 'Temp Mail - Your Temporary Email Address',
    description:
      'Instantly generate a free, secure, and anonymous temporary email address to protect your privacy online. No signup required.',
    images: [
      {
        url: 'https://tempmail.pages.dev/og-image.png',
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
    creator: '@tempmail',
    images: ['https://tempmail.pages.dev/twitter-image.png'],
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
      </head>
      <body className="font-sans">{children}</body>
    </html>
  )
}