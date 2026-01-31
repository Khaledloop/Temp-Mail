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
export const useTempMail = () => {
  const { sessionId, tempMailAddress, isSessionActive, setSession, clearSession } = useAuthStore();
  const { setEmails } = useInboxStore();
  const { addToast } = useUiStore();
  const [hasHydrated, setHasHydrated] = useState(false);
  const initInFlightRef = useRef<Promise<void> | null>(null);

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

      if (initInFlightRef.current) {
        await initInFlightRef.current;
        return;
      }

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

    // SESSION_TTL is in milliseconds, refresh 5 minutes (300000ms) before expiration
    const refreshTime = SESSION_TTL - 300000;

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
          clearSession();
          addToast({ 
            message: 'Session expired. Please create a new one.', 
            type: 'error', 
            duration: 3000 
          });
        }
      };

      refreshSession();
    }, refreshTime);

    return () => clearTimeout(refreshTimeout);
  }, [sessionId]);

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
      return response;
    },
    [setEmails, setSession]
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
