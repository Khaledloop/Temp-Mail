import Link from 'next/link';
import type { Metadata } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com').replace(
  /\/+$/,
  ''
);

export const metadata: Metadata = {
  title: 'Tools',
  description:
    "Explore Temp Mail Lab's free privacy tools, including Gmail Dot Generator and Password Generator for testing signups, safer workflows, and stronger passwords.",
  alternates: {
    canonical: `${baseUrl}/tools`,
  },
  openGraph: {
    title: 'Tools | Temp Mail Lab',
    description:
      "Explore Temp Mail Lab's free privacy tools, including Gmail Dot Generator and Password Generator for testing signups, safer workflows, and stronger passwords.",
    url: `${baseUrl}/tools`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tools | Temp Mail Lab',
    description:
      "Explore Temp Mail Lab's free privacy tools, including Gmail Dot Generator and Password Generator for testing signups, safer workflows, and stronger passwords.",
  },
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            Temp Mail Lab Utilities
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl dark:text-gray-100">
            Tools
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-400">
            Practical tools for privacy and account security. More utilities will be added
            over time.
          </p>
        </header>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          <Link
            href="/tools/gmail-dot-generator"
            prefetch={false}
            className="group rounded-[2rem] border border-gray-200/80 bg-white/85 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.45)] ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-[0_35px_85px_-48px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-white/5 dark:ring-white/10"
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-700 dark:text-brand-400">
              Email Testing Tool
            </p>
            <h2 className="mt-3 text-2xl font-black text-gray-900 dark:text-gray-100">
              Gmail Dot Generator
            </h2>
            <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
              Generate Gmail dot aliases, googlemail variations, and +tag combinations
              instantly in your browser for QA testing and signup segmentation.
            </p>
            <span className="mt-5 inline-flex text-xs font-black uppercase tracking-widest text-gray-700 transition group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white">
              Open Tool
            </span>
          </Link>

          <Link
            href="/tools/password-generator"
            prefetch={false}
            className="group rounded-[2rem] border border-gray-200/80 bg-white/85 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.45)] ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-[0_35px_85px_-48px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-white/5 dark:ring-white/10"
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-700 dark:text-brand-400">
              Security Tool
            </p>
            <h2 className="mt-3 text-2xl font-black text-gray-900 dark:text-gray-100">
              Password Generator
            </h2>
            <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
              Create strong passwords and passphrases locally in your browser with entropy
              scoring and copy-ready output.
            </p>
            <span className="mt-5 inline-flex text-xs font-black uppercase tracking-widest text-gray-700 transition group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white">
              Open Tool
            </span>
          </Link>

          <div className="rounded-[2rem] border border-dashed border-gray-300/80 bg-white/70 p-6 ring-1 ring-black/5 md:col-span-2 dark:border-white/15 dark:bg-white/5 dark:ring-white/10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              Coming Soon
            </p>
            <h2 className="mt-3 text-2xl font-black text-gray-900 dark:text-gray-100">
              More Free Tools
            </h2>
            <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
              Additional privacy and email-security utilities are planned for upcoming
              releases.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
