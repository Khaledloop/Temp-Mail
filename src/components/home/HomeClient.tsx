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
  const { isEmailViewerOpen, openEmailViewer, addToast } = useUiStore();
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
          <div className="bg-white/85 rounded-[2.5rem] shadow-[0_40px_80px_-30px_rgba(15,23,42,0.35)] p-6 sm:p-8 mb-10 border border-gray-200/80 ring-1 ring-black/5 backdrop-blur-md content-visibility-auto dark:bg-white/5 dark:border-white/10 dark:ring-white/10 dark:shadow-[0_45px_90px_-40px_rgba(0,0,0,0.9)]">
            <div className="mb-4 border-b border-gray-200/80 pb-4 dark:border-white/10">
              <div className="flex w-full items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-brand-600 p-3 rounded-2xl shadow-md ring-1 ring-white/40 dark:bg-white/15 dark:ring-white/20">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </div>
                  <div className="pt-1">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                      Inbox
                    </h2>
                    <div
                      className={`flex items-center gap-2 mt-1 min-h-[16px] transition-opacity duration-300 ${
                        isRefreshing ? 'opacity-100' : 'opacity-0'
                      }`}
                      aria-hidden={!isRefreshing}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full bg-brand-600 ${isRefreshing ? 'animate-pulse' : ''}`}
                      ></span>
                      <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                        Checking for mail...
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleFetchEmails}
                  disabled={isRefreshing || isLoading}
                  className="group mt-1 inline-flex shrink-0 items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-gray-900 font-bold shadow-sm border border-gray-200/80 ring-1 ring-black/5 hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 hover:bg-white active:scale-95 transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/10 dark:text-white dark:border-white/10 dark:ring-white/10 dark:hover:bg-white/20"
                >
                  <svg
                    className={`h-4 w-4 transition-transform duration-500 ease-in-out ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="min-h-[200px]">
              <InboxList
                isLoading={isLoading}
                isRefreshing={isRefreshing}
                onSelectEmail={handleSelectEmail}
                onDeleteEmail={handleDeleteEmail}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white/85 rounded-[2.5rem] shadow-[0_40px_80px_-30px_rgba(15,23,42,0.3)] p-8 sm:p-12 mb-12 border border-gray-200/80 ring-1 ring-black/5 backdrop-blur-md min-h-[360px] dark:bg-white/5 dark:border-white/10 dark:ring-white/10 dark:shadow-[0_45px_90px_-40px_rgba(0,0,0,0.9)]" aria-hidden="true">
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


