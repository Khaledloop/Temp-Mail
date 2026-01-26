/**
 * Zustand store for inbox state management
 * Handles email list, loading states, and email operations
 */

import { create } from 'zustand';
import type { Email } from '@/types';

interface InboxState {
  // Data
  emails: Email[];
  selectedEmailId: string | null;

  // UI states
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  setEmails: (emails: Email[]) => void;
  addEmail: (email: Email) => void;
  removeEmail: (emailId: string) => void;
  updateEmail: (emailId: string, updates: Partial<Email>) => void;
  selectEmail: (emailId: string | null) => void;
  getSelectedEmail: () => Email | undefined;
  clearInbox: () => void;

  // Loading & error states
  setLoading: (isLoading: boolean) => void;
  setRefreshing: (isRefreshing: boolean) => void;
  setError: (error: string | null) => void;
}

export const useInboxStore = create<InboxState>((set, get) => ({
  // Initial state
  emails: [],
  selectedEmailId: null,
  isLoading: false,
  isRefreshing: false,
  error: null,

  // Set entire email list (from API response)
  setEmails: (emails) => {
    set({ emails, error: null });
  },

  // Add single email (useful for real-time updates)
  addEmail: (email) => {
    set((state) => {
      // Avoid duplicates
      if (state.emails.some((e) => e.id === email.id)) {
        return state;
      }
      return { emails: [email, ...state.emails] };
    });
  },

  // Remove email by ID
  removeEmail: (emailId) => {
    set((state) => ({
      emails: state.emails.filter((e) => e.id !== emailId),
      selectedEmailId:
        state.selectedEmailId === emailId ? null : state.selectedEmailId,
    }));
  },

  // Update email properties
  updateEmail: (emailId, updates) => {
    set((state) => ({
      emails: state.emails.map((e) =>
        e.id === emailId ? { ...e, ...updates } : e
      ),
    }));
  },

  // Select email for viewing
  selectEmail: (emailId) => {
    set({ selectedEmailId: emailId });
  },

  // Get currently selected email
  getSelectedEmail: () => {
    const state = get();
    return state.emails.find((e) => e.id === state.selectedEmailId);
  },

  // Clear all emails
  clearInbox: () => {
    set({
      emails: [],
      selectedEmailId: null,
      error: null,
    });
  },

  // Set loading state
  setLoading: (isLoading) => {
    set({ isLoading });
  },

  // Set refreshing state (for polling)
  setRefreshing: (isRefreshing) => {
    set({ isRefreshing });
  },

  // Set error message
  setError: (error) => {
    set({ error });
  },
}));
