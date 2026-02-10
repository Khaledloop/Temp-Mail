'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTempMail } from '@/hooks/useTempMail';
import { useFetchEmails } from '@/hooks/useFetchEmails';
import { usePolling } from '@/hooks/usePolling';
import { useAuthStore } from '@/store/authStore';
import { useInboxStore } from '@/store/inboxStore';
import { useUiStore } from '@/store/uiStore';
import { Hero } from '@/components/Hero/Hero';
const InboxList = dynamic(
  () => import('@/components/Inbox/InboxList').then((mod) => mod.InboxList),
  { ssr: false }
);
import { EMAIL_POLL_INTERVAL } from '@/utils/constants';

const EmailViewerModal = dynamic(
  () => import('@/components/modals/EmailViewerModal').then((mod) => mod.EmailViewerModal),
  { ssr: false }
);

export function HomeClient() {
  const { changeEmailCustom, getRecoveryKey, recoverEmail, getDomains } = useTempMail();
  const { fetchEmails, deleteEmail } = useFetchEmails();

  const { isLoading, isRefreshing, selectEmail } = useInboxStore();
  const { tempMailAddress } = useAuthStore();
  const { isEmailViewerOpen, openEmailViewer, addToast, isDarkMode, toggleDarkMode } = useUiStore();
  const [pollResetSignal, setPollResetSignal] = useState(0);
  const [showInbox, setShowInbox] = useState(false);

  const handleAutoFetch = useCallback(() => fetchEmails({ source: 'auto' }), [fetchEmails]);
  const handleFetchEmails = useCallback(async () => {
    await fetchEmails({ source: 'manual' });
    setPollResetSignal((value) => value + 1);
  }, [fetchEmails]);

  const handleSelectEmail = useCallback(
    (id: string) => {
      selectEmail(id);
      openEmailViewer();
    },
    [selectEmail, openEmailViewer]
  );

  const handleDeleteEmail = useCallback(
    async (id: string) => {
      try {
        await deleteEmail(id);
        setPollResetSignal((value) => value + 1);
        addToast({ message: 'Email deleted', type: 'success', duration: 1500 });
      } catch (error) {
        console.error('Delete email failed:', error);
        addToast({ message: 'Failed to delete email', type: 'error', duration: 2000 });
      }
    },
    [deleteEmail, addToast]
  );

  useEffect(() => {
    if (!tempMailAddress) return;
    const bootstrap = async () => {
      await fetchEmails({ source: 'init' });
      setPollResetSignal((value) => value + 1);
    };

    bootstrap();
  }, [tempMailAddress, fetchEmails]);

  // Theme is managed globally by ThemeClient in the root layout.

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    const reveal = () => {
      if (!cancelled) setShowInbox(true);
    };
    const idleCallback = (window as Window & { requestIdleCallback?: Function }).requestIdleCallback;
    if (idleCallback) {
      const id = idleCallback(reveal, { timeout: 1200 });
      return () => {
        cancelled = true;
        const cancelIdle = (window as Window & { cancelIdleCallback?: Function }).cancelIdleCallback;
        if (cancelIdle) cancelIdle(id);
      };
    }
    const timeout = window.setTimeout(reveal, 600);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  usePolling(handleAutoFetch, {
    interval: EMAIL_POLL_INTERVAL,
    enabled: Boolean(tempMailAddress),
    immediate: false,
    resetSignal: pollResetSignal,
  });

  return (
    <>
      <button
        type="button"
        onClick={() => {
          toggleDarkMode();
        }}
        className="fixed top-4 right-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 dark:border-gray-300 dark:bg-black dark:text-white"
        aria-label={isDarkMode ? 'Disable dark mode' : 'Enable dark mode'}
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
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      </button>

      <div className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Hero
            isLoading={isLoading}
            onFetchEmails={handleFetchEmails}
            onChangeEmail={changeEmailCustom}
            onGetRecoveryKey={getRecoveryKey}
            onRecoverEmail={recoverEmail}
            onGetDomains={getDomains}
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        {showInbox ? (
          <div className="bg-white rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] p-8 sm:p-12 mb-12 border border-gray-100 content-visibility-auto">
            <div className="mb-12 border-b border-gray-100 pb-8">
              <div className="flex items-center gap-4">
                <div className="bg-brand-600 p-3 rounded-2xl dark:bg-white/15">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                    Inbox
                  </h2>
                  <div
                    className={`flex items-center gap-2 mt-1 min-h-[16px] transition-opacity duration-300 ${
                      isRefreshing ? 'opacity-100' : 'opacity-0'
                    }`}
                    aria-hidden={!isRefreshing}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-gray-900 ${isRefreshing ? 'animate-pulse' : ''}`}
                    ></span>
                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                      Checking for mail...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-[300px]">
              <InboxList
                isLoading={isLoading}
                isRefreshing={isRefreshing}
                onSelectEmail={handleSelectEmail}
                onDeleteEmail={handleDeleteEmail}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.06)] p-8 sm:p-12 mb-12 border border-gray-100 min-h-[360px]" aria-hidden="true">
            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
              Inbox loading...
            </div>
          </div>
        )}
      </div>

      {isEmailViewerOpen && <EmailViewerModal />}
    </>
  );
}
