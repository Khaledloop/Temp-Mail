/**
 * Hero component - displays email address with copy and refresh buttons
 */

'use client';

import { useState } from 'react';
import { HeroSkeleton } from '@/components/common/Skeleton';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';

interface HeroProps {
  onRefresh?: () => Promise<void>;
  onFetchEmails?: () => Promise<void>;
  isLoading?: boolean;
}

export function Hero({ onRefresh, onFetchEmails, isLoading = false }: HeroProps) {
  const { tempMailAddress, clearSession } = useAuthStore();
  const { addToast } = useUiStore();
  const [isCopying, setIsCopying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Show skeleton only if truly loading, not just missing data
  if (isLoading && !tempMailAddress) {
    return <HeroSkeleton />;
  }

  const handleCopyEmail = async () => {
    try {
      setIsCopying(true);
      const email = tempMailAddress || 'test@example.com';
      
      // Use native clipboard API
      await navigator.clipboard.writeText(email);
      
      addToast({
        message: 'Email copied to clipboard!',
        type: 'success',
        duration: 2000,
      });
      
      // Reset button after 1.5 seconds
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsCopying(false);
    } catch (error) {
      console.error('Copy error:', error);
      addToast({
        message: 'Failed to copy email',
        type: 'error',
        duration: 3000,
      });
      setIsCopying(false);
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    try {
      setIsRefreshing(true);
      await onRefresh();
    } catch (error) {
      console.error('Error refreshing email:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const displayEmail = tempMailAddress || 'Loading email address...';

  return (
    <div className="space-y-8 animate-fadeIn flex flex-col items-center">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex flex-col items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-black px-4 py-1.5 text-[10px] font-black text-white tracking-widest uppercase shadow-sm">
            Temporary Email Address
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter">
            Your Private Inbox
          </h1>
        </div>
        <p className="text-sm text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
          Forget about spam and hacking robots. Keep your real mailbox clean and secure. 
          Expires in 24 hours.
        </p>
      </div>

      {/* Email pill with Copy button on the right */}
      <div className="w-full max-w-2xl px-4">
        <div className="relative">
          <div className="rounded-full bg-gray-50 border border-gray-200 shadow-sm flex items-center overflow-hidden">
            <div className="flex-1 px-6 py-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase">YOUR ADDRESS</p>
              <div className="font-mono text-xl md:text-2xl font-bold text-gray-900 break-all select-all mt-1" id="emailDisplay">
                {displayEmail}
              </div>
            </div>

            <div className="pr-4 pl-2">
              <button
                onClick={handleCopyEmail}
                disabled={isCopying}
                className="inline-flex items-center gap-2 rounded-full bg-black text-white px-5 py-3 shadow-md hover:bg-gray-900 active:scale-95 transition-all font-bold text-sm"
                aria-label="Copy email"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <span className="hidden sm:inline">{isCopying ? 'COPIED!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* small actions under the pill */}
        <div className="flex justify-center gap-4 mt-6">
          {/* Refresh Button - Simple */}
          <button
            onClick={onFetchEmails}
            disabled={!onFetchEmails}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-gray-900 font-bold shadow-sm border border-gray-200 hover:shadow-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg 
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span className="text-sm">Refresh</span>
          </button>

          {/* Change Email Button */}
          <button
            onClick={handleRefresh}
            disabled={!onRefresh || isRefreshing}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-gray-900 font-bold shadow-sm border border-gray-200 hover:shadow-md hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg 
              className={`h-5 w-5 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span className="text-sm">{isRefreshing ? 'Changing...' : 'Change Email'}</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={() => {
              clearSession();
              addToast({ message: 'Logged out', type: 'info', duration: 1500 });
            }}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-gray-900 font-bold shadow-sm border border-gray-200 hover:shadow-md hover:bg-gray-50 active:scale-95 transition-all hover:text-red-600 hover:border-red-600"
          >
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
