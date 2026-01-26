'use client';

import { useState, useCallback } from 'react';
import { useInboxStore } from '@/store/inboxStore';
import { useAuthStore } from '@/store/authStore'; //
import { apiClient } from '@/api/client';

export const useFetchEmails = () => {
  const [loading, setLoading] = useState(false);
  const { setEmails } = useInboxStore();
  // نستخدم الإيميل نفسه للبحث عن الرسائل
  const { tempMailAddress } = useAuthStore(); 

  const fetchEmails = useCallback(async () => {
    // Check if session is active before fetching
    if (!tempMailAddress) return; 

    setLoading(true);
    try {
      // Fetch emails - sessionId is automatically added by interceptor via Authorization header
      const emails = await apiClient.getInbox();
      setEmails(emails);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  }, [tempMailAddress, setEmails]);

  return { loading, fetchEmails };
};