/**
 * Inbox list component - displays list of emails
 */

'use client';

import { memo, useCallback, useState } from 'react';
import { Mail, Trash2 } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white py-16 px-6 dark:border-white/10 dark:bg-white/5">
        <div className="rounded-full bg-gray-200 p-4 mb-4 dark:bg-white/10">
          <Mail className="h-8 w-8 text-gray-600 dark:text-gray-300" />
        </div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">No emails yet</p>
        <p className="text-sm text-gray-600 mt-2 text-center dark:text-gray-400">
          Emails will appear here as they arrive. Share your address above.
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
          ? 'border-l-gray-900 bg-gray-50 shadow-lg border border-gray-300 dark:border-l-white/70 dark:bg-white/5 dark:border-white/10'
          : 'border-l-gray-700 hover:border-l-gray-900 bg-white hover:bg-gray-50 hover:shadow-md border border-gray-200 dark:border-l-white/30 dark:hover:border-l-white/70 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10'
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
              className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-gray-900 font-black shadow-sm border border-gray-200 hover:shadow-md transition transform hover:scale-105 hover:text-red-600 hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 dark:bg-white/10 dark:text-white dark:border-white/10 dark:hover:bg-white/20"
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
                <Trash2 className="h-4 w-4" />
              )}
              <span className="text-xs font-black hidden sm:inline">Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}, areEmailRowEqual);
