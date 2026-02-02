'use client';

import { useState, useCallback, useRef } from 'react';
import { useInboxStore } from '@/store/inboxStore';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/api/client';
import { playNewEmailSound } from '@/utils/notifications';

export const useFetchEmails = () => {
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const { setEmails, emails, setRefreshing, removeEmail } = useInboxStore();
  const { tempMailAddress } = useAuthStore();
  const hasFetchedRef = useRef(false);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const inFlightRef = useRef(false);

  /**
   * Fetch emails list for current session
   * Called on mount and when user clicks Refresh
   */
  const fetchEmails = useCallback(async (options?: { source?: 'auto' | 'manual' | 'init' }) => {
    const source = options?.source ?? 'auto';
    if (!tempMailAddress) {
      console.warn('No temp mail address available');
      return;
    }

    if (inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setRefreshing(true);
    try {
      // Call getInbox - Authorization header added automatically by interceptor
      const emails = await apiClient.getInbox();

      if (Array.isArray(emails)) {
        if (hasFetchedRef.current && source !== 'init') {
          const newIds = emails
            .map((email) => email.id)
            .filter((id) => !seenIdsRef.current.has(id));

          if (newIds.length > 0) {
            void playNewEmailSound();
          }
        }

        seenIdsRef.current = new Set(emails.map((email) => email.id));
        hasFetchedRef.current = true;

        setEmails(emails);
      } else {
        console.warn('Invalid inbox response:', emails);
        setEmails([]);
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      setEmails([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      inFlightRef.current = false;
    }
  }, [tempMailAddress, setEmails, setRefreshing]);

  /**
   * Fetch single message details
   * Called when user clicks on an email
   */
  const fetchMessage = useCallback(
    async (messageId: string) => {
      setMessageLoading(true);
      try {
        const message = await apiClient.getMessage(messageId);
        return message;
      } catch (error) {
        console.error('Failed to fetch message:', error);
        throw error;
      } finally {
        setMessageLoading(false);
      }
    },
    []
  );

  /**
   * Delete a message
   */
  const deleteEmail = useCallback(
    async (messageId: string) => {
      await apiClient.deleteMessage(messageId);
      removeEmail(messageId);
    },
    [removeEmail]
  );

  return {
    loading,
    messageLoading,
    emails,
    fetchEmails,
    fetchMessage,
    deleteEmail,
  };
};
