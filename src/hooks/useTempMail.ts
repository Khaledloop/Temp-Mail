'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useInboxStore } from '@/store/inboxStore';
import { useUiStore } from '@/store/uiStore';
import { apiClient } from '@/api/client';
import { SESSION_TTL } from '@/utils/constants';

/**
 * Master hook for managing temp mail session and auto-refresh
 */
export const useTempMail = () => {
  const { sessionId, tempMailAddress, isSessionActive, setSession, clearSession } = useAuthStore();
  const { setEmails } = useInboxStore();
  const { addToast } = useUiStore();

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      if (sessionId && isSessionActive()) {
        return; // Session still valid
      }

      try {
        const response = await apiClient.createNewSession();
        setSession(response.sessionId, response.tempMailAddress, response.expiresAt);
        addToast({ message: 'Session created successfully', type: 'success', duration: 2000 });
      } catch (error) {
        console.error('Failed to create session:', error);
        addToast({ message: 'Failed to create session', type: 'error', duration: 3000 });
      }
    };

    initSession();
  }, []);

  // Auto-refresh session 5 minutes before expiration
  useEffect(() => {
    if (!sessionId) return;

    const refreshTimeout = setTimeout(() => {
      const refreshSession = async () => {
        try {
          const response = await apiClient.refreshSession(sessionId);
          setSession(response.sessionId, response.tempMailAddress, response.expiresAt);
        } catch (error) {
          console.error('Session refresh failed:', error);
          clearSession();
        }
      };

      refreshSession();
    }, SESSION_TTL - 300000); // 5 minutes before expiration

    return () => clearTimeout(refreshTimeout);
  }, [sessionId]);

  return {
    sessionId,
    tempMailAddress,
    isSessionActive: isSessionActive(),
    changeEmailAddress: async () => {
      try {
        const response = await apiClient.createNewSession();
        setSession(response.sessionId, response.tempMailAddress, response.expiresAt);
        setEmails([]); // Clear inbox
        addToast({ message: 'Email address changed', type: 'success', duration: 2000 });
      } catch (error) {
        addToast({ message: 'Failed to change email', type: 'error', duration: 3000 });
      }
    },
    clearSession,
  };
};
