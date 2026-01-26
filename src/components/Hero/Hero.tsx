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
  isLoading?: boolean;
}

export function Hero({ onRefresh, isLoading = false }: HeroProps) {
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
      
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = email;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      addToast({
        message: 'Email copied to clipboard!',
        type: 'success',
        duration: 2000,
      });
      
      // Reset button after showing success
      setTimeout(() => {
        setIsCopying(false);
      }, 1500);
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
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter">
            Your Private Inbox
          </h2>
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
                className="inline-flex items-center gap-2 rounded-full bg-black text-white px-5 py-3 shadow-md hover:bg-gray-900 transition font-black text-sm"
                aria-label="Copy email"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 2H9c-1.1 0-2 .9-2 2v6H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-6h6c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4 12h-4v4H9v-4H5v-4h4V8h2v4h4v4z"/>
                </svg>
                <span className="hidden sm:inline">{isCopying ? 'COPIED!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* small actions under the pill */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleRefresh}
            disabled={!onRefresh || isRefreshing}
            className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-gray-900 font-black shadow-sm border border-gray-200 hover:shadow-md transition transform hover:scale-105 disabled:opacity-50"
          >
            <svg 
              id="refreshIcon"
              className={`h-4 w-4 transition-transform ${isRefreshing ? 'animate-spin-smooth' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
            </svg>
            <span className="text-sm">{isRefreshing ? 'WAIT...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => {
              clearSession();
              addToast({ message: 'Logged out', type: 'info', duration: 1500 });
            }}
            className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-gray-900 font-black shadow-sm border border-gray-200 hover:shadow-md transition transform hover:scale-105 hover:text-red-600 hover:border-red-600"
          >
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
