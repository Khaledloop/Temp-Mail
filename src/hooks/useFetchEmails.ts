'use client';

import { useState, useCallback } from 'react';
import { useInboxStore } from '@/store/inboxStore';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/api/client';

export const useFetchEmails = () => {
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const { setEmails, emails } = useInboxStore();
  const { tempMailAddress } = useAuthStore();

  /**
   * Fetch emails list for current session
   * Called on mount and when user clicks Refresh
   */
  const fetchEmails = useCallback(async () => {
    if (!tempMailAddress) {
      console.warn('No temp mail address available');
      return;
    }

    setLoading(true);
    try {
      // Call getInbox - Authorization header added automatically by interceptor
      const emails = await apiClient.getInbox();
      
      if (Array.isArray(emails)) {
        setEmails(emails);
        console.log(`✅ Fetched ${emails.length} emails`);
      } else {
        console.warn('Invalid inbox response:', emails);
        setEmails([]);
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }, [tempMailAddress, setEmails]);

  /**
   * Fetch single message details
   * Called when user clicks on an email
   */
  const fetchMessage = useCallback(
    async (messageId: string) => {
      setMessageLoading(true);
      try {
        const message = await apiClient.getMessage(messageId);
        console.log(`✅ Fetched message: ${messageId}`);
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

  return {
    loading,
    messageLoading,
    emails,
    fetchEmails,
    fetchMessage,
  };
};
