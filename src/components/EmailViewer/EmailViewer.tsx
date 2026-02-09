/**
 * Email Viewer component - displays sanitized HTML email content
 */

'use client';

import {
  decodeQuotedPrintableIfNeeded,
  sanitizeEmailHTML,
  stripHTMLTags,
} from '@/utils/sanitizer';
import { formatEmailDateTime } from '@/utils/formatters';
import { formatSenderName } from '@/utils/formatters';
import { X } from 'lucide-react';
import type { Email } from '@/types';

interface EmailViewerProps {
  email: Email;
  onClose?: () => void;
}

export function EmailViewer({ email, onClose }: EmailViewerProps) {
  const rawHtml = email.htmlBody || '';
  const rawText = email.body || '';
  const htmlText = stripHTMLTags(rawHtml).trim();
  const bodyText = stripHTMLTags(rawText).trim();
  const shouldUseBody = bodyText.length > htmlText.length + 20;
  const contentSource = shouldUseBody ? rawText : (rawHtml || rawText);
  const decodedSource = decodeQuotedPrintableIfNeeded(contentSource);
  const sanitizedHTML = sanitizeEmailHTML(decodedSource);
  const fallbackText = stripHTMLTags(decodedSource).trim();
  const hasHtmlTags = /<\s*[a-z][^>]*>/i.test(sanitizedHTML);
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  const plainHtml = escapeHtml(stripHTMLTags(decodedSource)).replace(/\r?\n/g, '<br />');
  const renderHtml = hasHtmlTags ? sanitizedHTML : plainHtml;
  const hasRenderableHtml = stripHTMLTags(sanitizedHTML).trim().length > 0;
  const senderName = formatSenderName(email.from);
  const senderEmail = email.from;
  const displayDateTime = formatEmailDateTime(email.timestamp);

  const iframeCsp =
    "default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; font-src https: data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

  return (
    <div className="flex flex-col h-full min-h-0 bg-white rounded-2xl shadow-lg animate-slideUp overflow-hidden border border-gray-200">
      {/* Header - Clean */}
      <div className="relative border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 bg-white pr-14 sm:pr-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-xl font-bold text-gray-900 break-words leading-snug">
            {email.subject || <span className="text-gray-400 text-base">(No subject)</span>}
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="group absolute right-3 top-3 sm:static sm:ml-4 inline-flex items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-gray-900 font-black shadow-sm border border-gray-200 hover:shadow-md transition transform hover:scale-105 hover:text-red-600 hover:border-red-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
            <span className="text-xs font-black hidden sm:inline">Close</span>
          </button>
        )}
      </div>

      {/* Sender info - Clean */}
      <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gray-900 flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-sm sm:text-base font-bold text-white">
              {senderName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 truncate text-sm sm:text-base">
              {senderName}
            </p>
            <p className="text-[11px] sm:text-xs text-gray-600 truncate font-mono">
              {senderEmail}
            </p>
          </div>
        </div>
        <div className="mt-2 pt-2 sm:mt-3 sm:pt-3 border-t border-gray-200 flex items-center justify-between gap-3">
          <p className="text-[11px] sm:text-xs font-medium text-gray-700">
            Sent: {displayDateTime}
          </p>
          <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-800 border border-gray-300">
            <span className="relative flex h-1.5 w-1.5 mr-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gray-600"></span>
            </span>
            Received
          </span>
        </div>
      </div>

      {/* Email content - Clean */}
      <div className="flex-1 min-h-0 overflow-auto px-4 sm:px-6 py-4 sm:py-6">
        {hasRenderableHtml ? (
          <iframe
            title="Email content"
            className="h-full w-full rounded-xl border border-gray-200 bg-white"
            sandbox="allow-popups"
            referrerPolicy="no-referrer"
            srcDoc={`<!doctype html><html><head><meta charset="utf-8" />
              <meta http-equiv="Content-Security-Policy" content="${iframeCsp}" />
              <style>
              * { box-sizing: border-box; }
              html, body { width: 100%; }
              body { font-family: Arial, sans-serif; margin: 0; padding: 14px; color: #111827; line-height: 1.6; background: #ffffff; }
              img { max-width: 100% !important; height: auto !important; }
              a { color: #111827; text-decoration: underline; }
              table { width: 100% !important; max-width: 100% !important; border-collapse: collapse; }
              td, th { word-break: break-word; }
              pre { white-space: pre-wrap; word-break: break-word; }
              code { white-space: pre-wrap; word-break: break-word; }
              .email-content { max-width: 100%; overflow-wrap: anywhere; word-break: break-word; }
            </style></head><body><div class="email-content">${renderHtml}</div></body></html>`}
          />
        ) : (
          <div className="h-full w-full rounded-xl border border-gray-200 bg-white p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {fallbackText || 'No readable content.'}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 sm:px-6 py-3 bg-gray-50">
        <div className="flex items-center justify-center gap-2">
          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          <p className="text-[11px] sm:text-xs font-medium text-gray-600">This email will be deleted in 30 days</p>
          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
        </div>
      </div>
    </div>
  );
}

