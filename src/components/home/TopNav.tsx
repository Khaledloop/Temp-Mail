'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useUiStore } from '@/store/uiStore'

export function TopNav() {
  const { isDarkMode, toggleDarkMode } = useUiStore()
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastScroll = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    lastScroll.current = window.scrollY || document.documentElement.scrollTop || 0

    const update = () => {
      const current = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0)
      const delta = current - lastScroll.current
      const scrollingDown = delta > 2
      const scrollingUp = delta < -1

      if (current <= 20) {
        setHidden(false)
      } else if (scrollingDown) {
        setHidden(true)
        setMenuOpen(false)
      } else if (scrollingUp) {
        setHidden(false)
      }

      lastScroll.current = current
      ticking.current = false
    }

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(update)
        ticking.current = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${
        hidden ? '-translate-y-full pointer-events-none' : 'translate-y-0'
      }`}
    >
      <div className="bg-white/85 border-b border-gray-200/80 backdrop-blur-md dark:bg-black/55 dark:border-white/10">
        <div className="mx-auto w-full max-w-5xl px-3 py-2 sm:px-6 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" prefetch={false} className="inline-flex items-center gap-2.5 min-w-0" onClick={() => setMenuOpen(false)}>
              <Image
                src="/Temp-Mail-Lab-Light-64.png"
                alt="Temp Mail Lab"
                width={36}
                height={36}
                className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 dark:invert"
                priority
              />
              <span className="text-[11px] sm:text-xs font-black tracking-[0.22em] uppercase leading-none text-gray-800 dark:text-gray-100">
                Temp Mail Lab
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <nav className="hidden sm:flex items-center gap-6 text-[12px] font-bold tracking-[0.2em] uppercase text-gray-700 dark:text-gray-200">
                <Link href="/blog" prefetch={false} className="transition-colors hover:text-gray-950 dark:hover:text-white">
                  Blog
                </Link>
                <Link href="/privacy" prefetch={false} className="transition-colors hover:text-gray-950 dark:hover:text-white">
                  Privacy
                </Link>
                <Link href="/terms" prefetch={false} className="transition-colors hover:text-gray-950 dark:hover:text-white">
                  Terms
                </Link>
              </nav>

              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
                className={`relative inline-flex h-7 w-14 sm:h-8 sm:w-16 items-center rounded-full border p-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 ${
                  isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300/80 bg-white/90'
                }`}
              >
                <span
                  className={`inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full shadow-sm transition-transform duration-300 ${
                    isDarkMode ? 'translate-x-0 bg-white text-gray-900' : 'translate-x-7 sm:translate-x-8 bg-gray-950 text-white'
                  }`}
                >
                  {isDarkMode ? (
                    <svg viewBox="0 0 24 24" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="currentColor" aria-hidden="true">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3a1 1 0 0 1 .86 1.52 7 7 0 0 0 7.41 10.35A1 1 0 0 1 21 12.79z" />
                    </svg>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                className="sm:hidden inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300/80 bg-white/90 text-gray-800 transition hover:border-gray-400 dark:border-white/15 dark:bg-white/10 dark:text-gray-100"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              </button>
            </div>
          </div>

          {menuOpen ? (
            <div className="sm:hidden mt-2 rounded-xl border border-gray-200/80 bg-white/95 p-2 shadow-lg ring-1 ring-black/5 dark:border-white/10 dark:bg-[#0f0f0f] dark:ring-white/10">
              <nav className="flex flex-col text-[12px] font-bold tracking-[0.18em] uppercase text-gray-700 dark:text-gray-200">
                <Link href="/blog" prefetch={false} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:hover:bg-white/10 dark:hover:text-white">
                  Blog
                </Link>
                <Link href="/privacy" prefetch={false} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:hover:bg-white/10 dark:hover:text-white">
                  Privacy
                </Link>
                <Link href="/terms" prefetch={false} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:hover:bg-white/10 dark:hover:text-white">
                  Terms
                </Link>
              </nav>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
