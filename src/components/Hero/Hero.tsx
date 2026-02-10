/**
 * Hero component - displays email address with copy and refresh buttons
 */

'use client';

import { useState } from 'react';
import { HeroSkeleton } from '@/components/common/Skeleton';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';

interface HeroProps {
  onFetchEmails?: () => Promise<void>;
  onChangeEmail?: (
    localPart: string,
    domain: string,
    random?: boolean
  ) => Promise<unknown>;
  onGetRecoveryKey?: () => Promise<{ key: string }>;
  onRecoverEmail?: (key: string) => Promise<unknown>;
  onGetDomains?: () => Promise<string[]>;
  isLoading?: boolean;
}

export function Hero({
  onFetchEmails,
  onChangeEmail,
  onGetRecoveryKey,
  onRecoverEmail,
  onGetDomains,
  isLoading = false,
}: HeroProps) {
  const { tempMailAddress } = useAuthStore();
  const { addToast } = useUiStore();
  const [isCopying, setIsCopying] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [isChangeOpen, setIsChangeOpen] = useState(false);
  const [domainOptions, setDomainOptions] = useState<string[]>([]);
  const [domainLoading, setDomainLoading] = useState(false);
  const [localPart, setLocalPart] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState('');

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

  const generateRandomLocalPart = () => {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint8Array(8);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, (b) => (b % 36).toString(36)).join('');
    }
    return Math.random().toString(36).slice(2, 10);
  };

  const openRecoveryModal = async () => {
    if (!onGetRecoveryKey) {
      addToast({ message: 'Recovery is not available.', type: 'error', duration: 2000 });
      return;
    }
    setIsRecoveryOpen(true);
    setRecoveryLoading(true);
    try {
      const data = await onGetRecoveryKey();
      setRecoveryKey(data.key || '');
    } catch (error) {
      console.error('Failed to load recovery key:', error);
      addToast({ message: 'Failed to load recovery key', type: 'error', duration: 2500 });
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleRecoverEmail = async () => {
    if (!onRecoverEmail) return;
    const key = recoveryInput.trim();
    if (!key) {
      addToast({ message: 'Enter a recovery key', type: 'warning', duration: 2000 });
      return;
    }
    setRecoveryLoading(true);
    try {
      await onRecoverEmail(key);
      setRecoveryInput('');
      setIsRecoveryOpen(false);
      addToast({ message: 'Email recovered successfully', type: 'success', duration: 2000 });
    } catch (error) {
      console.error('Recovery failed:', error);
      addToast({ message: 'Recovery failed', type: 'error', duration: 2500 });
    } finally {
      setRecoveryLoading(false);
    }
  };

  const openChangeModal = async () => {
    setIsChangeOpen(true);
    setChangeError('');
    if (!domainOptions.length && onGetDomains) {
      setDomainLoading(true);
      try {
        const domains = await onGetDomains();
        setDomainOptions(domains);
        setSelectedDomain(domains[0] || '');
      } catch (error) {
        console.error('Failed to load domains:', error);
        addToast({ message: 'Failed to load domains', type: 'error', duration: 2500 });
      } finally {
        setDomainLoading(false);
      }
    }
  };

  const handleChangeEmail = async () => {
    if (!onChangeEmail) return;
    const trimmedLocal = localPart.trim();
    const domain = selectedDomain;
    if (!domain) {
      addToast({ message: 'Select a domain', type: 'warning', duration: 2000 });
      setChangeError('Please select a domain.');
      return;
    }
    setChangeLoading(true);
    setChangeError('');
    try {
      await onChangeEmail(trimmedLocal, domain, trimmedLocal.length === 0);
      setLocalPart('');
      setIsChangeOpen(false);
      addToast({ message: 'Email address updated', type: 'success', duration: 2000 });
    } catch (error) {
      console.error('Change email failed:', error);
      const apiMessage =
        (error as { message?: string; error?: string })?.message ||
        (error as { error?: string })?.error;
      const statusCode =
        (error as { statusCode?: number })?.statusCode ||
        (error as { response?: { status?: number } })?.response?.status;
      if (statusCode === 409) {
        const conflictMessage =
          apiMessage || 'Email already exists. Choose a different name or domain.';
        setChangeError(conflictMessage);
        addToast({ message: conflictMessage, type: 'warning', duration: 3000 });
      } else {
        const fallbackMessage = apiMessage || 'Failed to change email. Please try again.';
        setChangeError(fallbackMessage);
        addToast({ message: fallbackMessage, type: 'error', duration: 3000 });
      }
    } finally {
      setChangeLoading(false);
    }
  };

  const displayEmail = tempMailAddress || 'Loading email address...';

  return (
    <div className="space-y-8 flex flex-col items-center">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex flex-col items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-brand-600 px-4 py-1.5 text-[10px] font-black text-white tracking-widest uppercase shadow-sm dark:bg-white/15 dark:text-white dark:border dark:border-white/10">
            Temporary Email Address
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight dark:text-white">
            Your Private Inbox
          </h1>
        </div>
        <p className="text-sm text-gray-600 font-medium max-w-md mx-auto leading-relaxed dark:text-gray-400">
          Forget about spam and hacking robots. Keep your real mailbox clean and secure. 
          Expires in 30 days.
        </p>
      </div>

      {/* Email pill with Copy button on the right */}
      <div className="w-full max-w-2xl px-4">
        <div className="relative">
          <div className="rounded-3xl sm:rounded-full bg-gray-50 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 overflow-hidden dark:bg-white/5 dark:border-white/10">
            <div className="flex-1 min-w-0 px-6 pt-4 pb-2 sm:py-4">
              <p className="text-[10px] font-semibold text-gray-700 uppercase dark:text-gray-300">YOUR ADDRESS</p>
              <div className="mt-1">
                <div
                  id="emailDisplay"
                  className="min-h-[28px] font-mono text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-all select-all leading-tight dark:text-white"
                  aria-live="polite"
                >
                  {displayEmail}
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 sm:pb-0 sm:pr-4 sm:pl-2">
              <button
                onClick={handleCopyEmail}
                disabled={isCopying}
                className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-4 py-2.5 shadow-md transition-all duration-300 ease-out font-bold text-sm group ${
                  isCopying
                    ? 'bg-emerald-600 text-white shadow-lg scale-105'
                    : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-xl hover:scale-105 hover:-translate-y-0.5 active:scale-95 dark:bg-white/15 dark:text-white dark:border dark:border-white/10 dark:hover:bg-white/25'
                }`}
                aria-label="Copy email"
              >
                <svg className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <span>{isCopying ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* small actions under the pill */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6">
          {/* Refresh Button - Simple */}
          <button
            onClick={onFetchEmails}
            disabled={!onFetchEmails}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-gray-900 font-bold shadow-sm border border-gray-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1 hover:bg-gray-50 active:scale-95 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed group dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white/10"
          >
            <svg 
              className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500 ease-in-out"
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
            onClick={openChangeModal}
            disabled={changeLoading}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-gray-900 font-bold shadow-sm border border-gray-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1 hover:bg-gray-50 active:scale-95 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed group dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white/10"
          >
            <svg 
              className={`h-5 w-5 transition-transform duration-500 ${changeLoading ? 'animate-spin' : 'group-hover:rotate-180'}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span className="text-sm">Change Email</span>
          </button>

          {/* Recover Email Button */}
          <button
            onClick={openRecoveryModal}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-gray-900 font-bold shadow-sm border border-gray-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1 hover:bg-gray-50 active:scale-95 transition-all duration-300 ease-out group dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white/10"
          >
            <svg 
              className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="-1 -1 26 26"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-4a10 10 0 11-20 0 10 10 0 0120 0z"/>
            </svg>
            <span className="text-sm">Recovery Key</span>
          </button>

        </div>
      </div>

      {isChangeOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 sm:p-6 backdrop-blur animate-fadeIn overflow-y-auto"
          onClick={() => setIsChangeOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-5 sm:p-7 shadow-2xl animate-slideUp transition-all duration-300 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto dark:border-white/10 dark:bg-[#0d0d0d]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Change Email</h3>
              <button
                onClick={() => setIsChangeOpen(false)}
                className="group ml-4 inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-gray-900 font-black shadow-sm border border-gray-200 hover:shadow-md transition transform hover:scale-105 hover:text-red-600 hover:border-red-600 dark:bg-white/10 dark:text-white dark:border-white/10 dark:hover:bg-white/20"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x h-4 w-4 text-gray-900"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
                <span className="text-xs font-black hidden sm:inline">Close</span>
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Choose a custom name and domain. You can also generate a random name.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                  Email Name
                </label>
                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                  <input
                    value={localPart}
                    onChange={(event) => {
                      setLocalPart(event.target.value);
                      if (changeError) setChangeError('');
                    }}
                    placeholder="yourname"
                    className={`flex-1 rounded-2xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-2 ${
                      changeError
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-black focus:ring-black/10'
                    }`}
                  />
                  <button
                    onClick={() => setLocalPart(generateRandomLocalPart())}
                    className="w-full sm:w-auto rounded-2xl border border-gray-300 px-4 py-3 text-xs font-semibold text-gray-900 transition-all duration-300 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 whitespace-nowrap dark:border-white/10 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/10"
                  >
                    Random
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                  Domain
                </label>
                <div className="mt-2">
                  <select
                    value={selectedDomain}
                    onChange={(event) => {
                      setSelectedDomain(event.target.value);
                      if (changeError) setChangeError('');
                    }}
                    className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-2 ${
                      changeError
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-black focus:ring-black/10'
                    }`}
                  >
                    {domainLoading && <option>Loading domains...</option>}
                    {!domainLoading &&
                      (domainOptions.length ? (
                        domainOptions.map((domain) => (
                          <option key={domain} value={domain}>
                            {domain}
                          </option>
                        ))
                      ) : (
                        <option value="">No domains available</option>
                      ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleChangeEmail}
                disabled={changeLoading}
                className="w-full rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/15 dark:text-white dark:hover:bg-white/25"
              >
                {changeLoading ? 'Updating...' : 'Confirm Change'}
              </button>
              {changeError ? (
                <p className="text-xs font-semibold text-red-600">{changeError}</p>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {isRecoveryOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 sm:p-6 backdrop-blur animate-fadeIn overflow-y-auto"
          onClick={() => setIsRecoveryOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-5 sm:p-7 shadow-2xl animate-slideUp transition-all duration-300 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto dark:border-white/10 dark:bg-[#0d0d0d]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Recover Email</h3>
              <button
                onClick={() => setIsRecoveryOpen(false)}
                className="group ml-4 inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-gray-900 font-black shadow-sm border border-gray-200 hover:shadow-md transition transform hover:scale-105 hover:text-red-600 hover:border-red-600 dark:bg-white/10 dark:text-white dark:border-white/10 dark:hover:bg-white/20"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x h-4 w-4 text-gray-900"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
                <span className="text-xs font-black hidden sm:inline">Close</span>
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Keep this recovery key safe. It gives access to your inbox.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                  Current Recovery Key
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <span className="flex-1 break-all">
                    {recoveryLoading ? 'Loading...' : recoveryKey || 'Not available'}
                  </span>
                  <button
                    onClick={async () => {
                      if (!recoveryKey) return;
                      await navigator.clipboard.writeText(recoveryKey);
                      addToast({ message: 'Recovery key copied', type: 'success', duration: 1500 });
                    }}
                    className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-900 transition-all duration-300 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 dark:border-white/10 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/10"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                  Recover Another Email
                </label>
                <input
                  value={recoveryInput}
                  onChange={(event) => setRecoveryInput(event.target.value)}
                  placeholder="Paste recovery key"
                  className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                />
              </div>
              <button
                onClick={handleRecoverEmail}
                disabled={recoveryLoading}
                className="w-full rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/15 dark:text-white dark:hover:bg-white/25"
              >
                {recoveryLoading ? 'Recovering...' : 'Recover Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
