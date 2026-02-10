"use client"

import {useEffect, useState} from 'react'

export function Footer() {
  const year = new Date().getFullYear()
  const [supportHref, setSupportHref] = useState<string | null>(null)

  useEffect(() => {
    const user = 'support'
    const domain = 'tempmaillab.com'
    setSupportHref(`mailto:${user}@${domain}`)
  }, [])

  return (
    <footer className="border-t border-gray-100 bg-white text-gray-600 dark:border-white/10 dark:bg-[#0d0d0d] dark:text-gray-300">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 text-sm sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-black tracking-[0.3em] uppercase text-gray-600 dark:text-gray-200">
              Temp Mail Lab
            </p>
            <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
              Private, fast, and disposable email for safer sign-ups.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-300">
            <a href="/blog" className="transition-colors hover:text-gray-900 dark:hover:text-gray-100">
              Blog
            </a>
            <a href="/privacy" className="transition-colors hover:text-gray-900 dark:hover:text-gray-100">
              Privacy
            </a>
            <a href="/terms" className="transition-colors hover:text-gray-900 dark:hover:text-gray-100">
              Terms
            </a>
            {supportHref ? (
              <a href={supportHref} className="transition-colors hover:text-gray-900 dark:hover:text-gray-100">
                Support
              </a>
            ) : (
              <span className="cursor-default text-gray-500 dark:text-gray-400">Support</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-100 pt-6 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400 sm:flex-row sm:items-center">
          <span>(c) {year} Temp Mail Lab. All rights reserved.</span>
          <span>Built for privacy and search visibility.</span>
        </div>
      </div>
    </footer>
  )
}
