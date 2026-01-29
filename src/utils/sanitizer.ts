/**
 * Email content sanitization utility using DOMPurify
 * Prevents XSS attacks when rendering HTML emails
 */

import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'html', 'body',
  'p', 'br', 'b', 'i', 'em', 'strong', 'a',
  'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'code',
  'img', 'hr', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  'div', 'span', 'center', 'font', 'small', 'big', 'sup', 'sub', 'u', 's', 'del', 'ins',
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'title',
  'src', 'alt', 'width', 'height',
  'align', 'valign', 'bgcolor', 'class', 'id', 'style', 'dir', 'lang',
  'colspan', 'rowspan', 'cellpadding', 'cellspacing', 'border', 'color', 'face', 'size',
];

const FORBID_TAGS = ['script', 'iframe', 'object', 'embed', 'form', 'base'];
const ALLOWED_URI_REGEXP = /^(?:(?:https?|mailto|tel):|#|\/|\.\/|\.\.\/|\/\/|data:image\/)/i;

let hooksInstalled = false;

function ensureDomPurifyHooks() {
  if (hooksInstalled) return;

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    const nodeName = typeof node?.nodeName === 'string' ? node.nodeName.toLowerCase() : '';
    if (nodeName === 'a') {
      const href = node.getAttribute('href');
      if (href) {
        node.setAttribute('target', '_blank');
        const existingRel = node.getAttribute('rel') || '';
        const relParts = new Set(
          existingRel
            .split(/\s+/)
            .map((entry) => entry.trim())
            .filter(Boolean)
        );
        relParts.add('noopener');
        relParts.add('noreferrer');
        node.setAttribute('rel', Array.from(relParts).join(' '));
      }
    }
  });

  DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
    const attrName = data.attrName?.toLowerCase() || '';
    if (attrName.startsWith('on')) {
      data.keepAttr = false;
      return;
    }

    if (attrName === 'href') {
      const value = String(data.attrValue || '').trim().toLowerCase();
      if (value.startsWith('javascript:') || value.startsWith('data:')) {
        data.keepAttr = false;
      }
    }

    if (attrName === 'src') {
      const value = String(data.attrValue || '').trim().toLowerCase();
      if (value.startsWith('javascript:')) {
        data.keepAttr = false;
      }
      if (value.startsWith('data:') && !value.startsWith('data:image/')) {
        data.keepAttr = false;
      }
    }
  });

  hooksInstalled = true;
}

/**
 * Sanitizes HTML content from emails to prevent XSS attacks
 * @param dirtyHTML - Raw HTML content from email
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeEmailHTML(dirtyHTML: string): string {
  try {
    ensureDomPurifyHooks();

    let normalizedHTML = String(dirtyHTML || '');
    for (let i = 0; i < 2; i += 1) {
      const hasEscapedTags = /&lt;[a-z!/][^&]*&gt;/i.test(normalizedHTML) || /&amp;lt;/.test(normalizedHTML);
      const hasRealTags = /<\s*[a-z!/]/i.test(normalizedHTML);
      if (!hasEscapedTags || hasRealTags) break;

      normalizedHTML = normalizedHTML
        .replace(/&amp;lt;/gi, '&lt;')
        .replace(/&amp;gt;/gi, '&gt;')
        .replace(/&amp;quot;/gi, '&quot;')
        .replace(/&amp;#39;/gi, '&#39;')
        .replace(/&amp;amp;/gi, '&amp;')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&amp;/gi, '&');
    }

    return DOMPurify.sanitize(normalizedHTML, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      FORBID_TAGS,
      ALLOWED_URI_REGEXP,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      KEEP_CONTENT: true,
    });
  } catch (error) {
    console.error('Error sanitizing email HTML:', error);
    return '<p>Unable to display email content.</p>';
  }
}

/**
 * Removes all HTML tags and returns plain text
 * Useful for email subject/preview extraction
 * @param html - HTML content
 * @returns Plain text without HTML
 */
export function stripHTMLTags(html: string): string {
  try {
    const decoded = html.replace(/&[a-z]+;/gi, (match) => {
      const element = document.createElement('div');
      element.innerHTML = match;
      return element.textContent || match;
    });
    return decoded.replace(/<[^>]*>/g, '');
  } catch {
    return html;
  }
}

/**
 * Extracts plain text preview from HTML content (first 150 chars)
 * @param html - HTML content
 * @param maxLength - Maximum length of preview (default: 150)
 * @returns Plain text preview
 */
export function getEmailPreview(html: string, maxLength: number = 150): string {
  const plainText = stripHTMLTags(html);
  return plainText.length > maxLength
    ? plainText.substring(0, maxLength).trim() + '...'
    : plainText;
}
