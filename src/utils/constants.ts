/**
 * Application constants
 */

// Polling interval for fetching emails (in milliseconds)
export const EMAIL_POLL_INTERVAL = 5000; // 5 seconds

// Session TTL (time-to-live) in milliseconds
export const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

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
  EMAIL_DETAIL: (emailId: string) => `/api/email/${emailId}`,
  DELETE_EMAIL: (emailId: string) => `/api/email/${emailId}`,
  REFRESH_SESSION: '/api/refresh_session',
} as const;

// SEO service pages
export const SEO_SERVICES = [
  { slug: 'facebook', name: 'Facebook', description: 'Get a temporary email for Facebook registration' },
  { slug: 'instagram', name: 'Instagram', description: 'Secure temporary email for Instagram signup' },
  { slug: 'discord', name: 'Discord', description: 'Disposable email for Discord accounts' },
  { slug: 'gmail', name: 'Gmail', description: 'Temporary email for Gmail and Google services' },
  { slug: 'twitter', name: 'Twitter/X', description: 'Temporary email for Twitter and X' },
  { slug: 'linkedin', name: 'LinkedIn', description: 'Disposable email for LinkedIn profiles' },
  { slug: 'reddit', name: 'Reddit', description: 'Temporary email for Reddit accounts' },
  { slug: 'twitch', name: 'Twitch', description: 'Disposable email for Twitch registration' },
] as const;

// UI constants
export const UI = {
  SKELETON_ANIMATE_DURATION: 2000, // milliseconds
  TOAST_DURATION: 3000, // milliseconds
  MODAL_TRANSITION_DURATION: 0.3, // seconds
} as const;
