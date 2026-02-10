'use client';

import { useEffect, useRef, useState } from 'react';
import { useUiStore } from '@/store/uiStore';

export function TopNav() {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScroll = useRef(0);
  const ticking = useRef(false);
  const { isDarkMode, toggleDarkMode } = useUiStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    lastScroll.current = window.scrollY || document.documentElement.scrollTop || 0;

    const update = () => {
      const current = Math.max(
        0,
        window.scrollY || document.documentElement.scrollTop || 0
      );
      const delta = current - lastScroll.current;
      const scrollingDown = delta > 2;
      const scrollingUp = delta < -1;

      if (current <= 20) {
        setHidden(false);
      } else if (scrollingDown) {
        setHidden(true);
      } else if (scrollingUp) {
        setHidden(false);
      }

      lastScroll.current = current;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(update);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${
        hidden ? '-translate-y-full pointer-events-none' : 'translate-y-0'
      }`}
    >
      <div className="bg-white/80 border-b border-gray-200/80 backdrop-blur-md dark:bg-white/5 dark:border-white/10">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 grid grid-cols-3 items-center gap-3 text-[11px] font-bold tracking-[0.2em] uppercase text-gray-700 dark:text-gray-300">
          <div className="flex items-center justify-start">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200/80 bg-white/80 text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-95 dark:border-white/10 dark:bg-white/10 dark:text-gray-200"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>

          <a href="/" className="flex items-center justify-center gap-2 sm:gap-3">
            <img
              src="/Temp-Mail-Lab-Light.png"
              alt="Temp Mail Lab"
              className="h-7 w-auto sm:h-9 dark:hidden"
              loading="eager"
            />
            <img
              src="/Temp-Mail-Lab.png"
              alt="Temp Mail Lab"
              className="h-7 w-auto sm:h-9 hidden dark:block"
              loading="eager"
            />
            <span className="hidden sm:inline text-xs font-black tracking-[0.25em] uppercase text-gray-700 dark:text-gray-200">
              Temp Mail Lab
            </span>
          </a>

          <div className="flex items-center justify-end gap-3">
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-4">
              <a href="/blog" className="transition-colors hover:text-gray-950 dark:hover:text-white">
                Blog
              </a>
              <a href="/privacy" className="transition-colors hover:text-gray-950 dark:hover:text-white">
                Privacy
              </a>
              <a href="/terms" className="transition-colors hover:text-gray-950 dark:hover:text-white">
                Terms
              </a>
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200/80 bg-white/80 text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-95 dark:border-white/10 dark:bg-white/10 dark:text-gray-200"
              aria-label={isDarkMode ? 'Disable dark mode' : 'Enable dark mode'}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            </button>
          </div>

          {menuOpen ? (
            <div className="sm:hidden absolute left-4 right-4 top-full mt-2 rounded-2xl border border-gray-200/80 bg-white/95 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.5)] ring-1 ring-black/5 backdrop-blur-md dark:border-white/10 dark:bg-[#0f0f0f] dark:ring-white/10">
              <div className="flex flex-col gap-3 px-4 py-4 text-[11px] font-bold tracking-[0.2em] uppercase text-gray-700 dark:text-gray-200">
                <a
                  href="/blog"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex transition-colors hover:text-gray-950 active:scale-95 dark:hover:text-white"
                >
                  Blog
                </a>
                <a
                  href="/privacy"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex transition-colors hover:text-gray-950 active:scale-95 dark:hover:text-white"
                >
                  Privacy
                </a>
                <a
                  href="/terms"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex transition-colors hover:text-gray-950 active:scale-95 dark:hover:text-white"
                >
                  Terms
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
