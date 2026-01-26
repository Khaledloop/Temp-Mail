/**
 * Email content sanitization utility using DOMPurify
 * Prevents XSS attacks when rendering HTML emails
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content from emails to prevent XSS attacks
 * @param dirtyHTML - Raw HTML content from email
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeEmailHTML(dirtyHTML: string): string {
  try {
    return DOMPurify.sanitize(dirtyHTML, {
      ALLOWED_TAGS: [
        'p', 'br', 'b', 'i', 'em', 'strong', 'a',
        'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'pre', 'code',
        'img', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span',
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel',
        'src', 'alt', 'width', 'height',
        'align', 'class', 'id',
      ],
      ALLOW_UNKNOWN_PROTOCOLS: false,
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
