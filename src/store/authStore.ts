/**
 * Zustand store for authentication and session management
 * Handles email address, session ID, and session expiration
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Session } from '@/types';
import { STORAGE_KEYS, SESSION_TTL } from '@/utils/constants';
import { isSessionValid } from '@/utils/validators';

interface AuthState {
  // Session data
  sessionId: string | null;
  tempMailAddress: string | null;
  createdAt: string | null;
  expiresAt: string | null;

  // Actions
  setSession: (sessionId: string, address: string, expiresAt: string) => void;
  updateSession: (session: Session) => void;
  clearSession: () => void;
  isSessionActive: () => boolean;
  getSessionId: () => string | null;
  getTempMailAddress: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionId: null,
      tempMailAddress: null,
      createdAt: null,
      expiresAt: null,

      // Set session after creating new one
      setSession: (sessionId, address, expiresAt) => {
        const now = new Date().toISOString();
        set({
          sessionId,
          tempMailAddress: address,
          createdAt: now,
          expiresAt,
        });
      },

      // Update session (for refresh)
      updateSession: (session) => {
        set({
          sessionId: session.sessionId,
          tempMailAddress: session.tempMailAddress,
          expiresAt: session.expiresAt,
        });
      },

      // Clear session
      clearSession: () => {
        set({
          sessionId: null,
          tempMailAddress: null,
          createdAt: null,
          expiresAt: null,
        });
      },

      // Check if session is still active
      isSessionActive: () => {
        const state = get();
        if (state.expiresAt) {
          const expires = new Date(state.expiresAt).getTime();
          if (!Number.isNaN(expires)) {
            return Date.now() < expires;
          }
        }

        if (!state.createdAt) return false;
        return isSessionValid(state.createdAt, SESSION_TTL);
      },

      // Get current session ID
      getSessionId: () => get().sessionId,

      // Get current temp mail address
      getTempMailAddress: () => get().tempMailAddress,
    }),
    {
      name: STORAGE_KEYS.SESSION_ID,
      storage: createJSONStorage(() => {
        // Fallback to in-memory storage if localStorage is not available
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      // Only persist specific fields
      partialize: (state) => ({
        sessionId: state.sessionId,
        tempMailAddress: state.tempMailAddress,
        createdAt: state.createdAt,
        expiresAt: state.expiresAt,
      }),
    }
  )
);
