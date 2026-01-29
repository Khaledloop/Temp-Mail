'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTempMail } from '@/hooks/useTempMail';
import { useFetchEmails } from '@/hooks/useFetchEmails';
import { usePolling } from '@/hooks/usePolling';
import { useAuthStore } from '@/store/authStore';
import { useInboxStore } from '@/store/inboxStore';
import { useUiStore } from '@/store/uiStore';
import { Hero } from '@/components/Hero/Hero';
import { InboxList } from '@/components/Inbox/InboxList';
import { SeoContent } from '@/components/home/SeoContent';

const EmailViewerModal = dynamic(
  () => import('@/components/modals/EmailViewerModal').then((mod) => mod.EmailViewerModal),
  { ssr: false }
);


export default function HomePage() {
  // Initialize session
  const { changeEmailAddress } = useTempMail();

  // Fetch emails with polling
  const { fetchEmails } = useFetchEmails();

  // Get stores
  const { isLoading, isRefreshing, selectEmail } = useInboxStore();
  const { tempMailAddress } = useAuthStore();
  const { isEmailViewerOpen, openEmailViewer } = useUiStore();

  const handleRefresh = useCallback(() => changeEmailAddress(), [changeEmailAddress]);
  const handleFetchEmails = useCallback(() => fetchEmails(), [fetchEmails]);
  const handleSelectEmail = useCallback(
    (id: string) => {
      selectEmail(id);
      openEmailViewer();
    },
    [selectEmail, openEmailViewer]
  );

  // Auto-refresh emails every 10 seconds (paused when tab is hidden)
  usePolling(handleFetchEmails, {
    interval: 10000,
    enabled: Boolean(tempMailAddress),
    immediate: true,
  });

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Top Banner - Subtle Gray */}
      <div className="bg-gray-50 border-b border-gray-100 py-3 text-center">
        <p className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">
          100% Anonymous • High Speed • Free Forever
        </p>
      </div>

      {/* Header Section */}
      <div className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Hero
            isLoading={isLoading}
            onRefresh={handleRefresh}
            onFetchEmails={handleFetchEmails}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        {/* Inbox Section - Ultra Rounded & Clean */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] p-8 sm:p-12 mb-12 border border-gray-100 animate-slideUp">
          <div className="mb-12 border-b border-gray-100 pb-8">
            <div className="flex items-center gap-4">
              <div className="bg-black p-3 rounded-2xl">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  Inbox
                </h2>
                {isRefreshing && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-900 animate-pulse"></span>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Checking for mail...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="min-h-[300px]">
            <InboxList
              isLoading={isLoading}
              onSelectEmail={handleSelectEmail}
            />
          </div>
        </div>

        {/* Features - Black & White Minimalist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: '⚡', title: 'INSTANT', desc: 'No signup' },
            { icon: '🔒', title: 'PRIVATE', desc: 'Encrypted' },
            { icon: '⏱️', title: 'TEMP', desc: '24h auto' },
            { icon: '💰', title: 'FREE', desc: 'Always' },
          ].map((feature, idx) => (
            <button
              key={idx}
              onClick={() => {}}
              className="group bg-gray-50 rounded-[1.5rem] p-6 border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-all duration-300 transform hover:scale-105 hover:bg-white hover:border-gray-300 cursor-pointer"
            >
              <div className="text-3xl mb-3 group-hover:scale-125 transition-transform duration-300">{feature.icon}</div>
              <h3 className="font-black text-xs text-gray-900 mb-1 tracking-widest">{feature.title}</h3>
              <p className="text-xs text-gray-500 font-bold uppercase">{feature.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* SEO Content Section */}
      <div className="py-12">
        <SeoContent />
      </div>

      {/* Email Viewer Modal */}
      {isEmailViewerOpen && <EmailViewerModal />}
    </div>
  );
}
