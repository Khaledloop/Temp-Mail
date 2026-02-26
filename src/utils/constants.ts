/**
 * Application constants
 */

// Polling interval for fetching emails (in milliseconds)
export const EMAIL_POLL_INTERVAL = 10000; // 10 seconds

// Session TTL (time-to-live) in milliseconds
export const SESSION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

// LocalStorage keys
export const STORAGE_KEYS = {
  SESSION_ID: 'temp_mail_session_id',
  EMAIL_ADDRESS: 'temp_mail_address',
  SESSION_CREATED: 'temp_mail_session_created',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  NEW_SESSION: '/api/new_session',
  INBOX: '/api/inbox',
  EMAIL_DETAIL: (emailId: string) => `/api/message/${encodeURIComponent(emailId)}`,
  DELETE_EMAIL: (emailId: string) => `/api/message/${encodeURIComponent(emailId)}`,
  REFRESH_SESSION: '/api/refresh_session',
} as const;

// UI constants
export const UI = {
  SKELETON_ANIMATE_DURATION: 2000, // milliseconds
  TOAST_DURATION: 3000, // milliseconds
  MODAL_TRANSITION_DURATION: 0.3, // seconds
} as const;
