import type { Metadata } from 'next';
import { HomeClient } from '@/components/home/HomeClient';
import { SeoContent } from '@/components/home/SeoContent';
import { DeferredVignette } from '@/components/ads/DeferredVignette';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Free Temporary Email Address',
  description:
    'Create an anonymous temporary email inbox instantly. No signup, no personal data, and automatic cleanup after 30 days.',
  alternates: {
    canonical: baseUrl,
  },
  keywords: [
    'temp mail',
    'free temporary email',
    'disposable inbox',
    'anonymous inbox',
    'avoid spam',
  ],
};

export default function HomePage() {
  const features = [
    { icon: 'FAST', title: 'INSTANT', desc: 'No signup' },
    { icon: 'SAFE', title: 'PRIVATE', desc: 'Privacy first' },
    { icon: 'TIME', title: 'TEMP', desc: '30d auto' },
    { icon: 'FREE', title: 'FREE', desc: 'Always' },
  ];

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <HomeClient />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-white/85 rounded-[1.5rem] p-6 border border-gray-200/80 ring-1 ring-black/5 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.4)] flex flex-col items-center text-center transition-all duration-300 transform hover:scale-105 hover:bg-white hover:border-gray-300 hover:shadow-[0_25px_55px_-35px_rgba(15,23,42,0.45)] cursor-pointer backdrop-blur-md dark:bg-white/5 dark:border-white/10 dark:ring-white/10 dark:hover:bg-white/10 dark:hover:border-white/20 dark:shadow-[0_25px_60px_-40px_rgba(0,0,0,0.9)]"
            >
              <div className="text-xs font-black tracking-[0.3em] text-gray-700 mb-3 group-hover:text-gray-900 transition-colors duration-300 dark:text-gray-300 dark:group-hover:text-white">
                {feature.icon}
              </div>
              <h3 className="font-black text-xs text-gray-900 mb-1 tracking-widest dark:text-gray-100">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-600 font-bold uppercase dark:text-gray-400">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="py-12">
        <SeoContent />
      </div>
      <DeferredVignette />
    </div>
  );
}
