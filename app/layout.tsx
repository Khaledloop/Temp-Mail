import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import { JsonLd } from '@/components/seo/JsonLd'
import { ThemeClient } from '@/components/theme/ThemeClient'
import { Footer } from '@/components/common/Footer'
import { TopNav } from '@/components/home/TopNav'
import { DeferredVignette } from '@/components/ads/DeferredVignette'

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
})

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com')
  .replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Temp Mail Lab - Your Temporary Email Address',
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
    siteName: 'Temp Mail Lab',
    title: 'Temp Mail Lab - Your Temporary Email Address',
    description:
      'Instantly generate a free, secure, and anonymous temporary email address to protect your privacy online. No signup required.',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Temp Mail Lab - Temporary Email Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Temp Mail Lab - Your Temporary Email Address',
    description:
      'Instantly generate a free, secure, and anonymous temporary email address to protect your privacy online.',
    images: [`${baseUrl}/twitter-image.png`],
  },
  icons: {
    icon: [
      {url: '/favicon.ico'},
      {url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png'},
      {url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png'},
      {url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png'},
      {url: '/icon-192x192.png', sizes: '192x192', type: 'image/png'},
    ],
    apple: [{url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png'}],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const themeScript = `
    (function () {
      try {
        var stored = localStorage.getItem('theme');
        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        var isDark = stored === 'dark' || (!stored && prefersDark);
        var root = document.documentElement;
        
        if (isDark) {
          root.classList.add('dark');
          root.dataset.theme = 'dark';
          root.style.colorScheme = 'dark';
          // Inject style immediately to prevent FOUC (Flash of Unstyled Content)
          var style = document.createElement('style');
          style.id = 'dark-mode-style';
          style.innerHTML = 'body { background-color: #050505 !important; color: #f5f5f5 !important; }';
          document.head.appendChild(style);
        } else {
          root.classList.remove('dark');
          root.dataset.theme = 'light';
          root.style.colorScheme = 'light';
        }
      } catch (e) {}
    })();
  `
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={manrope.className}>
        <ThemeClient />
        <TopNav />
        <main className="pt-16 sm:pt-20">{children}</main>
        <Footer />
        <DeferredVignette />
      </body>
    </html>
  )
}
