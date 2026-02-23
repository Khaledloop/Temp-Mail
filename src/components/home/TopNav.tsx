'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useUiStore } from '@/store/uiStore'

export function TopNav() {
  const { isDarkMode, toggleDarkMode } = useUiStore()

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="bg-white/85 border-b border-gray-200/80 backdrop-blur-md dark:bg-black/55 dark:border-white/10">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" prefetch={false} className="inline-flex items-center gap-3">
            <Image
              src="/Temp-Mail-Lab-Light-64.png"
              alt="Temp Mail Lab"
              width={36}
              height={36}
              className="h-9 w-9 dark:invert"
              priority
            />
            <span className="text-xs font-black tracking-[0.25em] uppercase text-gray-800 dark:text-gray-100">
              Temp Mail Lab
            </span>
          </Link>

          <nav className="flex items-center justify-end gap-4 text-[11px] font-bold tracking-[0.2em] uppercase text-gray-700 dark:text-gray-200">
            <Link href="/blog" prefetch={false} className="transition-colors hover:text-gray-950 dark:hover:text-white">
              Blog
            </Link>
            <Link href="/privacy" prefetch={false} className="transition-colors hover:text-gray-950 dark:hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" prefetch={false} className="transition-colors hover:text-gray-950 dark:hover:text-white">
              Terms
            </Link>
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300/80 bg-white/90 text-gray-700 transition hover:scale-105 hover:border-gray-400 hover:text-gray-900 dark:border-white/15 dark:bg-white/10 dark:text-gray-200 dark:hover:border-white/30 dark:hover:text-white"
            >
              {isDarkMode ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M12 4a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1zm0 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm8-6a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1zM7 12a1 1 0 0 1-1 1H5a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1zm9.657-5.657a1 1 0 0 1 1.414 0l.707.707a1 1 0 1 1-1.414 1.414l-.707-.707a1 1 0 0 1 0-1.414zM6.343 16.243a1 1 0 0 1 1.414 0l.707.707a1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1 0-1.414zm11.435 1.414a1 1 0 0 1 0-1.414l.707-.707a1 1 0 1 1 1.414 1.414l-.707.707a1 1 0 0 1-1.414 0zM6.343 7.757a1 1 0 0 1 0-1.414l.707-.707a1 1 0 1 1 1.414 1.414l-.707.707a1 1 0 0 1-1.414 0z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3a1 1 0 0 1 .86 1.52 7 7 0 0 0 7.41 10.35A1 1 0 0 1 21 12.79z" />
                </svg>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
