/**
 * Inbox list component - displays list of emails
 */

'use client';

import { memo, useCallback, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { EmailSkeleton } from '@/components/common/Skeleton';
import { useInboxStore } from '@/store/inboxStore';
import { formatEmailTime } from '@/utils/formatters';
import { truncateText } from '@/utils/formatters';
import { formatSenderName } from '@/utils/formatters';
import { decodeQuotedPrintableIfNeeded, stripHTMLTags } from '@/utils/sanitizer';
import type { Email } from '@/types';

interface InboxListProps {
  isLoading?: boolean;
  isRefreshing?: boolean;
  onSelectEmail?: (emailId: string) => void;
  onDeleteEmail?: (emailId: string) => Promise<void>;
}

export function InboxList({
  isLoading = false,
  isRefreshing = false,
  onSelectEmail,
  onDeleteEmail,
}: InboxListProps) {
  const { emails, selectedEmailId } = useInboxStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteEmail = useCallback(async (emailId: string) => {
    if (!onDeleteEmail) return;

    try {
      setDeletingId(emailId);
      await onDeleteEmail(emailId);
    } finally {
      setDeletingId(null);
    }
  }, [onDeleteEmail]);

  if (isLoading) {
    return (
      <div className="divide-y divide-gray-200">
        {Array.from({ length: 5 }).map((_, i) => (
          <EmailSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300/80 bg-white/80 py-16 px-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.4)] ring-1 ring-black/5 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:ring-white/10 dark:shadow-[0_30px_70px_-45px_rgba(0,0,0,0.9)]">
        <div className="mb-4 flex h-24 w-24 items-center justify-center" aria-hidden="true">
          <svg className="h-24 w-24" viewBox="0 0 92 87" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26 54.37V38.9C26.003 37.125 26.9469 35.4846 28.48 34.59L43.48 25.84C45.027 24.9468 46.933 24.9468 48.48 25.84L63.48 34.59C65.0285 35.4745 65.9887 37.1167 66 38.9V54.37C66 57.1314 63.7614 59.37 61 59.37H31C28.2386 59.37 26 57.1314 26 54.37Z" fill="#8C92A5" />
            <path d="M46 47.7L26.68 36.39C26.2325 37.1579 25.9978 38.0312 26 38.92V54.37C26 57.1314 28.2386 59.37 31 59.37H61C63.7614 59.37 66 57.1314 66 54.37V38.9C66.0022 38.0112 65.7675 37.1379 65.32 36.37L46 47.7Z" fill="#CDCDD8" />
            <path d="M27.8999 58.27C28.7796 58.9758 29.8721 59.3634 30.9999 59.37H60.9999C63.7613 59.37 65.9999 57.1314 65.9999 54.37V38.9C65.9992 38.0287 65.768 37.1731 65.3299 36.42L27.8999 58.27Z" fill="#E5E5F0" />
            <g
              style={{ animation: 'spin 4s linear infinite', transformOrigin: '46px 43.5px', transformBox: 'fill-box' }}
            >
              <path d="M77.8202 29.21L89.5402 25.21C89.9645 25.0678 90.4327 25.1942 90.7277 25.5307C91.0227 25.8673 91.0868 26.348 90.8902 26.75L87.0002 34.62C86.8709 34.8874 86.6407 35.0924 86.3602 35.19C86.0798 35.2806 85.7751 35.2591 85.5102 35.13L77.6502 31.26C77.2436 31.0643 76.9978 30.6401 77.0302 30.19C77.0677 29.7323 77.3808 29.3438 77.8202 29.21Z" fill="#E5E5F0" />
              <path d="M5.12012 40.75C6.36707 20.9791 21.5719 4.92744 41.2463 2.61179C60.9207 0.296147 79.4368 12.3789 85.2401 31.32" stroke="#E5E5F0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14.18 57.79L2.46001 61.79C2.03313 61.9358 1.56046 61.8088 1.2642 61.4686C0.967927 61.1284 0.906981 60.6428 1.11001 60.24L5.00001 52.38C5.12933 52.1127 5.35954 51.9076 5.64001 51.81C5.92044 51.7194 6.22508 51.7409 6.49001 51.87L14.35 55.74C14.7224 55.9522 14.9394 56.36 14.9073 56.7874C14.8753 57.2149 14.5999 57.5857 14.2 57.74L14.18 57.79Z" fill="#E5E5F0" />
              <path d="M86.9998 45.8C85.9593 65.5282 70.9982 81.709 51.4118 84.2894C31.8254 86.8697 13.1841 75.1156 7.06982 56.33" stroke="#E5E5F0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">No emails yet</p>
        <p className="text-sm text-gray-600 mt-2 text-center dark:text-gray-400">
          Waiting for incoming emails
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {emails.map((email, index) => (
        <EmailRow
          key={email.id}
          email={email}
          isSelected={selectedEmailId === email.id}
          isDeleting={deletingId === email.id}
          isRefreshing={isRefreshing}
          onSelectEmail={onSelectEmail}
          onDeleteEmail={handleDeleteEmail}
          index={index}
        />
      ))}
    </div>
  );
}

interface EmailRowProps {
  email: Email;
  isSelected?: boolean;
  isDeleting?: boolean;
  isRefreshing?: boolean;
  onSelectEmail?: (emailId: string) => void;
  onDeleteEmail?: (emailId: string) => Promise<void>;
  index?: number;
}

const areEmailRowEqual = (prev: EmailRowProps, next: EmailRowProps) => {
  const prevEmail = prev.email;
  const nextEmail = next.email;

  return (
    prevEmail.id === nextEmail.id &&
    prevEmail.subject === nextEmail.subject &&
    prevEmail.from === nextEmail.from &&
    prevEmail.timestamp === nextEmail.timestamp &&
    prevEmail.body === nextEmail.body &&
    prevEmail.htmlBody === nextEmail.htmlBody &&
    prev.isSelected === next.isSelected &&
    prev.isDeleting === next.isDeleting &&
    prev.isRefreshing === next.isRefreshing &&
    prev.index === next.index &&
    prev.onSelectEmail === next.onSelectEmail &&
    prev.onDeleteEmail === next.onDeleteEmail
  );
};

const EmailRow = memo(function EmailRow({
  email,
  isSelected = false,
  isDeleting = false,
  isRefreshing = false,
  onSelectEmail,
  onDeleteEmail,
  index = 0,
}: EmailRowProps) {
  const senderName = formatSenderName(email.from);
  const previewSource = decodeQuotedPrintableIfNeeded(
    email.htmlBody || email.body
  );
  const preview = truncateText(stripHTMLTags(previewSource), 80);
  const timeString = formatEmailTime(email.timestamp);
  const handleClick = useCallback(() => {
    onSelectEmail?.(email.id);
  }, [onSelectEmail, email.id]);

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDeleteEmail?.(email.id);
    },
    [onDeleteEmail, email.id]
  );

  return (
    <div
      onClick={handleClick}
      style={{
        animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
      }}
      className={`group relative cursor-pointer rounded-xl border-l-4 transition-all duration-300 overflow-hidden ${
        isSelected
          ? 'border-l-brand-600 bg-white/90 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.45)] border border-gray-200/80 ring-1 ring-black/5 dark:border-l-white/70 dark:bg-white/10 dark:border-white/10 dark:ring-white/10 dark:shadow-[0_25px_60px_-40px_rgba(0,0,0,0.9)]'
          : 'border-l-brand-200 hover:border-l-brand-600 bg-white/75 hover:bg-white/90 hover:shadow-md border border-gray-200/70 ring-1 ring-black/5 dark:border-l-white/30 dark:hover:border-l-white/70 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:ring-white/10'
      }`}
    >
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Avatar - Clean dark */}
          <div className={`h-12 w-12 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-white transition-all ${
            isSelected
              ? 'bg-brand-700 shadow-lg dark:bg-white/20'
              : 'bg-brand-600 group-hover:bg-brand-700 group-hover:shadow-md dark:bg-white/15 dark:group-hover:bg-white/25'
          }`}>
            {senderName.charAt(0).toUpperCase()}
          </div>

          {/* Email info */}
          <div className="flex-1 min-w-0">
            {/* Sender and time */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className={`font-bold truncate transition-colors ${
                isSelected
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-900 group-hover:text-gray-900 dark:text-gray-100 dark:group-hover:text-white'
              }`}>
                {senderName}
              </p>
              <span className={`text-xs flex-shrink-0 font-medium transition-colors ${
                isSelected
                  ? 'text-gray-700 dark:text-gray-400'
                  : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
              }`}>
                {timeString}
              </span>
            </div>

            {/* Subject */}
            <p className={`text-sm font-semibold truncate mb-1.5 transition-colors ${
              isSelected
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-800 group-hover:text-gray-900 dark:text-gray-100 dark:group-hover:text-white'
            }`}>
              {email.subject || <span className="italic text-gray-500 dark:text-gray-400">(No subject)</span>}
            </p>

            {/* Preview */}
            <p className={`text-sm truncate transition-colors ${
              isSelected
                ? 'text-gray-700 dark:text-gray-300'
                : 'text-gray-600 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
            }`}>
              {preview}
            </p>
          </div>

          {/* Delete button - Hero style */}
          {onDeleteEmail && (
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting || isRefreshing}
              className="group inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-gray-900 font-black shadow-sm border border-gray-200/80 ring-1 ring-black/5 hover:shadow-md transition transform hover:scale-105 hover:text-red-600 hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 dark:bg-white/10 dark:text-white dark:border-white/10 dark:ring-white/10 dark:hover:bg-white/20"
              aria-label="Delete email"
            >
              {isDeleting ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <Trash2 className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}, areEmailRowEqual);
