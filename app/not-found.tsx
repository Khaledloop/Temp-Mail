export default function NotFound() {
  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-xs font-black tracking-[0.3em] text-gray-500 uppercase">
          Temp Mail Lab
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="mt-4 text-base text-gray-600 max-w-2xl mx-auto">
          The page you requested does not exist. It may have been moved, renamed,
          or removed. You can return to the homepage or explore the blog.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/"
            className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-900"
          >
            Back to Home
          </a>
          <a
            href="/blog"
            className="rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-900 transition hover:border-gray-300"
          >
            Visit the Blog
          </a>
        </div>
      </div>
    </div>
  )
}
