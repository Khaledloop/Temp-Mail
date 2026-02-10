import { HomeClient } from '@/components/home/HomeClient';
import { SeoContent } from '@/components/home/SeoContent';

export default function HomePage() {
  const features = [
    { icon: 'FAST', title: 'INSTANT', desc: 'No signup' },
    { icon: 'SAFE', title: 'PRIVATE', desc: 'Privacy first' },
    { icon: 'TIME', title: 'TEMP', desc: '30d auto' },
    { icon: 'FREE', title: 'FREE', desc: 'Always' },
  ];

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="bg-gray-50 border-b border-gray-100 py-3 text-center dark:bg-white/5 dark:border-white/10">
        <p className="text-[10px] font-black tracking-[0.3em] text-gray-600 uppercase dark:text-gray-300">
          100% Anonymous - High Speed - Free Forever
        </p>
      </div>

      <div className="border-b border-gray-100 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-center gap-4 text-[11px] font-bold tracking-[0.2em] uppercase text-gray-500 dark:text-gray-300">
          <a href="/blog" className="transition-colors hover:text-gray-900 dark:hover:text-white">
            Blog
          </a>
          <a href="/privacy" className="transition-colors hover:text-gray-900 dark:hover:text-white">
            Privacy
          </a>
          <a href="/terms" className="transition-colors hover:text-gray-900 dark:hover:text-white">
            Terms
          </a>
        </div>
      </div>

      <HomeClient />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-gray-50 rounded-[1.5rem] p-6 border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-all duration-300 transform hover:scale-105 hover:bg-white hover:border-gray-300 cursor-pointer dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20"
            >
              <div className="text-xs font-black tracking-[0.3em] text-gray-600 mb-3 group-hover:text-gray-900 transition-colors duration-300 dark:text-gray-300 dark:group-hover:text-white">
                {feature.icon}
              </div>
              <h3 className="font-black text-xs text-gray-900 mb-1 tracking-widest dark:text-gray-100">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-500 font-bold uppercase dark:text-gray-400">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="py-12">
        <SeoContent />
      </div>
    </div>
  );
}
