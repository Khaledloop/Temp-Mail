/**
 * API endpoint constants
 * Centralized definitions for all API routes
 */

export const API_ROUTES = {
  // Session management
  NEW_SESSION: '/api/new_session',
  REFRESH_SESSION: '/api/refresh_session',
  
  // Email operations
  INBOX: '/api/inbox',
  EMAIL_DETAIL: (emailId: string) => `/api/email/${emailId}`,
  DELETE_EMAIL: (emailId: string) => `/api/email/${emailId}`,
  MARK_READ: (emailId: string) => `/api/email/${emailId}/read`,
  
  // Optional features
  SEARCH_EMAILS: '/api/search',
  GET_ATTACHMENTS: (emailId: string) => `/api/email/${emailId}/attachments`,
} as const;

/**
 * API error messages
 */
export const API_ERRORS = {
  INVALID_SESSION: 'Session expired or invalid. Please create a new one.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_REQUEST: 'Invalid request parameters.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Unauthorized. Please create a new session.',
} as const;
