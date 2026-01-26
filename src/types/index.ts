/**
 * Core type definitions for the Temp Mail SaaS application
 */

export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  htmlBody: string;
  timestamp: string;
  read: boolean;
}

export interface Session {
  sessionId: string;
  tempMailAddress: string;
  createdAt: string;
  expiresAt: string;
}

export interface InboxResponse {
  sessionId: string;
  emails: Email[];
  totalCount: number;
}

export interface NewSessionResponse {
  sessionId: string;
  tempMailAddress: string;
  expiresAt: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
