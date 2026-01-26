/**
 * Formatting utilities for dates, times, and text
 */

import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

/**
 * Format email timestamp to human-readable format
 * Shows relative time (e.g., "2 hours ago") for recent emails
 * Shows date (e.g., "Jan 20") for older emails
 */
export function formatEmailTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();

    if (isToday(date)) {
      return format(date, 'HH:mm');
    }

    if (isYesterday(date)) {
      return 'Yesterday';
    }

    return format(date, 'MMM dd');
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format timestamp with full date and time
 * Useful for email detail view
 */
export function formatEmailDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'PPpp'); // "Jan 20, 2026, 2:30 PM"
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Extract domain from email address
 */
export function getEmailDomain(email: string): string {
  const parts = email.split('@');
  return parts.length > 1 ? parts[1] : '';
}

/**
 * Format sender name, fallback to email if name not available
 */
export function formatSenderName(from: string): string {
  // Extract name from "Name <email@domain.com>" format
  const nameMatch = from.match(/^"?([^<"]*)"?\s*</);
  if (nameMatch && nameMatch[1]) {
    return nameMatch[1].trim();
  }
  return from;
}
