import Link from 'next/link';
import type { Metadata } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://temp-mail-6xq.pages.dev')
  .replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Blog - Temp Mail',
  description: 'Tips, guides, and updates about temporary email and online privacy.',
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Blog
          </h1>
          <Link href="/" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition">
            Back to Home
          </Link>
        </div>

        <p className="mt-4 text-gray-600 text-base">
          We are preparing helpful articles about temporary email, privacy, and online safety.
        </p>

        <div className="mt-10 rounded-3xl border border-gray-200 bg-gray-50 p-6">
          <p className="text-sm font-semibold text-gray-700">Coming soon</p>
          <p className="mt-2 text-sm text-gray-600">
            New posts will appear here. If you have a topic request, let us know.
          </p>
        </div>
      </div>
    </div>
  );
}
