import Link from 'next/link'

export function Footer() {
  const year = new Date().getFullYear()
  const supportHref = 'mailto:support@tempmaillab.com'

  return (
    <footer className="border-t border-gray-200/80 bg-white/85 text-gray-700 shadow-[0_-25px_60px_-50px_rgba(15,23,42,0.35)] ring-1 ring-black/5 backdrop-blur-md dark:border-white/10 dark:bg-black/60 dark:text-gray-300 dark:ring-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 text-sm sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <Link
              href="/"
              prefetch={false}
              className="text-xs font-black tracking-[0.3em] uppercase text-gray-700 transition-colors hover:text-gray-950 dark:text-gray-200 dark:hover:text-white"
            >
              Temp Mail Lab
            </Link>
            <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
              Private, fast, and disposable email for safer sign-ups.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-widest text-gray-700 dark:text-gray-300">
            <Link href="/blog" prefetch={false} className="transition-colors hover:text-gray-900 dark:hover:text-gray-100">
              Blog
            </Link>
            <Link href="/privacy" prefetch={false} className="transition-colors hover:text-gray-900 dark:hover:text-gray-100">
              Privacy
            </Link>
            <Link href="/terms" prefetch={false} className="transition-colors hover:text-gray-900 dark:hover:text-gray-100">
              Terms
            </Link>
            <a href={supportHref} className="transition-colors hover:text-gray-900 dark:hover:text-gray-100">
              Support
            </a>
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-200/80 pt-6 text-xs text-gray-600 dark:border-white/10 dark:text-gray-300 sm:flex-row sm:items-center">
          <span>(c) {year} Temp Mail Lab. All rights reserved.</span>
          <span>Built for privacy and search visibility.</span>
        </div>
      </div>
    </footer>
  )
}
