/**
 * Email Viewer component - displays sanitized HTML email content
 */

'use client';

import { sanitizeEmailHTML } from '@/utils/sanitizer';
import { formatEmailDateTime } from '@/utils/formatters';
import { formatSenderName } from '@/utils/formatters';
import { X } from 'lucide-react';
import type { Email } from '@/types';

interface EmailViewerProps {
  email: Email;
  onClose?: () => void;
}

export function EmailViewer({ email, onClose }: EmailViewerProps) {
  const sanitizedHTML = sanitizeEmailHTML(email.htmlBody || email.body);
  const senderName = formatSenderName(email.from);
  const senderEmail = email.from;
  const displayDateTime = formatEmailDateTime(email.timestamp);

  return (
    <div className="flex flex-col h-full min-h-0 bg-white rounded-2xl shadow-lg animate-slideUp overflow-hidden border border-gray-200">
      {/* Header - Clean */}
      <div className="border-b border-gray-200 px-6 py-5 flex items-center justify-between bg-white">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 break-words">
            {email.subject || <span className="text-gray-400 text-base">(No subject)</span>}
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="group ml-4 inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-gray-900 font-black shadow-sm border border-gray-200 hover:shadow-md transition transform hover:scale-105 hover:text-red-600 hover:border-red-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
            <span className="text-xs font-black hidden sm:inline">Close</span>
          </button>
        )}
      </div>

      {/* Sender info - Clean */}
      <div className="border-b border-gray-200 px-6 py-5 bg-gray-50">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-lg bg-gray-900 flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-lg font-bold text-white">
              {senderName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 truncate text-lg">
              {senderName}
            </p>
            <p className="text-sm text-gray-600 truncate font-mono">
              {senderEmail}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            📅 {displayDateTime}
          </p>
          <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-800 border border-gray-300">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-600"></span>
            </span>
            Received
          </span>
        </div>
      </div>

      {/* Email content - Clean */}
      <div className="flex-1 min-h-0 overflow-auto px-6 py-8">
        <div
          className="prose prose-sm max-w-none text-gray-900 
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-gray-900 prose-a:hover:text-gray-700 prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-bold
            prose-em:text-gray-700
            prose-img:rounded-lg prose-img:shadow-md
            prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:rounded prose-code:px-2 prose-code:py-1
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:rounded prose-blockquote:px-4 prose-blockquote:py-2
            prose-li:marker:text-blue-600"
          dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-center gap-2">
          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          <p className="text-sm font-medium text-gray-600">
            ⏰ This email will be deleted in 24 hours
          </p>
          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
        </div>
      </div>
    </div>
  );
}
