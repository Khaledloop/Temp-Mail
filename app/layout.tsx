import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import { JsonLd } from '@/components/seo/JsonLd'
import { Footer } from '@/components/common/Footer'
import { TopNav } from '@/components/home/TopNav'
import { ThemeClient } from '@/components/theme/ThemeClient'

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
})

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com')
  .replace(/\/+$/, '')

const siteName = 'Temp Mail Lab'
const siteDescription =
  'Generate a free temporary email address in seconds. Private, disposable inboxes to avoid spam and protect your identity online.'

export const metadata: Metadata = {
  title: {
    default: 'Temp Mail Lab - Free Temporary Email Address',
    template: '%s | Temp Mail Lab',
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{name: 'Temp Mail Lab Team', url: baseUrl}],
  creator: siteName,
  publisher: siteName,
  category: 'Technology',
  keywords: [
    'temp mail',
    'temporary email',
    'disposable email',
    'anonymous email',
    'anti spam email',
    'privacy email tool',
  ],
  metadataBase: new URL(baseUrl),
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
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
    canonical: '/',
    types: {
      'application/rss+xml': `${baseUrl}/blog/rss.xml`,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName,
    title: 'Temp Mail Lab - Free Temporary Email Address',
    description: siteDescription,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Temp Mail Lab - Disposable email inbox',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Temp Mail Lab - Free Temporary Email Address',
    description: siteDescription,
    images: ['/twitter-image'],
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
      </body>
    </html>
  )
}

