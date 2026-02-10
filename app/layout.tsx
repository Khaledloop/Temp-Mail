import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import { JsonLd } from '@/components/seo/JsonLd'
import { ThemeClient } from '@/components/theme/ThemeClient'
import { Footer } from '@/components/common/Footer'
import { TopNav } from '@/components/home/TopNav'

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
})

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com')
  .replace(/\/+$/, '')
const apiOrigin = (() => {
  const raw =
    process.env.NEXT_PUBLIC_API_ORIGIN ||
    process.env.NEXT_PUBLIC_API_URL ||
    ''
  if (!raw) return ''
  try {
    return new URL(raw).origin
  } catch {
    return ''
  }
})()

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
    icon: '/Temp%20Mail%20Lab%20Favicon%20.png',
    apple: '/Temp%20Mail%20Lab%20Favicon%20.png',
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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {apiOrigin ? (
          <>
            <link rel="preconnect" href={apiOrigin} crossOrigin="" />
            <link rel="dns-prefetch" href={apiOrigin} />
          </>
        ) : null}
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
