import Image from 'next/image'
import Link from 'next/link'

export function TopNav() {
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
          </nav>
        </div>
      </div>
    </header>
  )
}
