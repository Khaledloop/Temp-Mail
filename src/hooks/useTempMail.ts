'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useInboxStore } from '@/store/inboxStore';
import { useUiStore } from '@/store/uiStore';
import { apiClient } from '@/api/client';
import { SESSION_TTL } from '@/utils/constants';

/**
 * Master hook for managing temp mail session and auto-refresh
 * 
 * Responsibilities:
 * 1. Initialize session on mount (if not already active)
 * 2. Auto-refresh session 5 minutes before expiration
 * 3. Handle session errors gracefully
 */
const MAX_TIMEOUT_MS = 2_147_483_647; // 2^31-1 (setTimeout safe max)
const INIT_COOLDOWN_MS = 30_000; // prevent rapid session creation loops
const REFRESH_MARGIN_MS = 5 * 60 * 1000; // 5 minutes

export const useTempMail = () => {
  const { sessionId, tempMailAddress, expiresAt, isSessionActive, setSession, clearSession } = useAuthStore();
  const { setEmails } = useInboxStore();
  const { addToast } = useUiStore();
  const [hasHydrated, setHasHydrated] = useState(false);
  const initInFlightRef = useRef<Promise<void> | null>(null);
  const lastInitAttemptRef = useRef(0);
  const initFailedRef = useRef(false);

  /**
   * Initialize session on mount
   * 
   * Why: Frontend needs a valid sessionId before making authenticated requests
   * How: Check if existing session is valid, otherwise create a new one
   */
  useEffect(() => {
    setHasHydrated(useAuthStore.persist.hasHydrated());
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    const initSession = async () => {
      // Check if session already exists and is active
      if (sessionId && isSessionActive()) {
        return; // Session still valid, no need to create new one
      }

      if (initFailedRef.current) {
        return;
      }

      const now = Date.now();
      if (now - lastInitAttemptRef.current < INIT_COOLDOWN_MS) {
        return;
      }

      if (initInFlightRef.current) {
        await initInFlightRef.current;
        return;
      }

      lastInitAttemptRef.current = now;
      initInFlightRef.current = (async () => {
        try {
          const response = await apiClient.createNewSession();
          
          // Map backend response to store
          setSession(response.sessionId, response.tempMailAddress, response.expiresAt);
          
          addToast({ 
            message: 'Session created successfully', 
            type: 'success', 
            duration: 2000 
          });
        } catch (error) {
          console.error('Failed to create session:', error);
          initFailedRef.current = true;
          addToast({ 
            message: 'Failed to create session. Please refresh the page.', 
            type: 'error', 
            duration: 3000 
          });
        } finally {
          initInFlightRef.current = null;
        }
      })();

      await initInFlightRef.current;
    };

    initSession();
  }, [hasHydrated, sessionId, isSessionActive, addToast, setSession]);

  /**
   * Auto-refresh session 5 minutes before expiration
   * 
   * Why: Prevent session from expiring while user is actively using the app
   * How: Calculate refresh time based on SESSION_TTL
   */
  useEffect(() => {
    if (!sessionId) return;

    const now = Date.now();
    const expiresAtMs = expiresAt ? new Date(expiresAt).getTime() : NaN;
    const refreshAtMs = Number.isFinite(expiresAtMs)
      ? expiresAtMs - REFRESH_MARGIN_MS
      : now + SESSION_TTL - REFRESH_MARGIN_MS;

    let refreshDelay = refreshAtMs - now;

    if (!Number.isFinite(refreshDelay) || refreshDelay <= 0) {
      return;
    }

    if (refreshDelay > MAX_TIMEOUT_MS) {
      refreshDelay = MAX_TIMEOUT_MS;
    }

    const refreshTimeout = setTimeout(() => {
      const refreshSession = async () => {
        try {
          const response = await apiClient.refreshSession();
          setSession(response.sessionId, response.tempMailAddress, response.expiresAt);

          addToast({ 
            message: 'Session refreshed', 
            type: 'success', 
            duration: 1500 
          });
        } catch (error) {
          console.error('Session refresh failed:', error);
          addToast({ 
            message: 'Session refresh failed. Please try again later.', 
            type: 'error', 
            duration: 3000 
          });
        }
      };

      refreshSession();
    }, refreshDelay);

    return () => clearTimeout(refreshTimeout);
  }, [sessionId, expiresAt, addToast, setSession]);

  /**
   * Change email address by creating a new session
   */
  const changeEmailAddress = useCallback(async () => {
    try {
      const response = await apiClient.changeEmail({ random: true });
      setSession(response.sessionId, response.tempMailAddress, response.expiresAt);
      setEmails([]); // Clear inbox for new address
      
      addToast({ 
        message: 'Email address changed successfully', 
        type: 'success', 
        duration: 2000 
      });
    } catch (error) {
      console.error('Failed to change email:', error);
      addToast({ 
        message: 'Failed to change email address', 
        type: 'error', 
        duration: 3000 
      });
    }
  }, [addToast, setEmails, setSession]);

  const changeEmailCustom = useCallback(
    async (localPart: string, domain: string, random = false) => {
      const response = await apiClient.changeEmail({ localPart, domain, random });
      setSession(response.sessionId, response.tempMailAddress, response.expiresAt);
      setEmails([]);
      addToast({
        message: 'New email address created',
        type: 'success',
        duration: 2000,
      });
      return response;
    },
    [addToast, setEmails, setSession]
  );

  const getRecoveryKey = useCallback(async () => {
    return apiClient.getRecoveryKey();
  }, []);

  const recoverEmail = useCallback(
    async (key: string) => {
      const response = await apiClient.recoverEmail(key);
      setSession(response.sessionId, response.tempMailAddress, response.expiresAt);
      setEmails([]);
      return response;
    },
    [setEmails, setSession]
  );

  const getDomains = useCallback(async () => {
    return apiClient.getDomains();
  }, []);

  return {
    sessionId,
    tempMailAddress,
    isSessionActive: isSessionActive(),
    changeEmailAddress,
    changeEmailCustom,
    getRecoveryKey,
    recoverEmail,
    getDomains,
    clearSession,
  };
};
