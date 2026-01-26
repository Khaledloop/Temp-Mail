/**
 * Custom hook for fetching emails from inbox
 * Handles loading, error states, and email list updates
 */

import { useCallback, useEffect } from 'react';
import { useInboxStore } from '@/store/inboxStore';
import { useAuthStore } from '@/store/authStore';
import { usePolling } from './usePolling';
import { apiClient } from '@/api/client';
import { EMAIL_POLL_INTERVAL } from '@/utils/constants';
import type { ApiError } from '@/types';

interface UseFetchEmailsOptions {
  pollingInterval?: number;
  enabled?: boolean;
  onError?: (error: ApiError) => void;
}

export function useFetchEmails(options: UseFetchEmailsOptions = {}) {
  const {
    pollingInterval = EMAIL_POLL_INTERVAL,
    enabled = true,
    onError,
  } = options;

  const { sessionId } = useAuthStore();
  const {
    emails,
    isLoading,
    isRefreshing,
    setEmails,
    setLoading,
    setRefreshing,
    setError,
  } = useInboxStore();

  // Fetch emails from API
  const fetchEmails = useCallback(async () => {
    if (!sessionId) return;

    try {
      setRefreshing(true);
      const response = await apiClient.getInbox(sessionId);
      setEmails(response.emails);
      setError(null);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message);
      if (onError) onError(apiError);
      console.error('Error fetching emails:', apiError);
    } finally {
      setRefreshing(false);
    }
  }, [sessionId, setEmails, setError, setRefreshing, onError]);

  // Initial fetch on mount
  useEffect(() => {
    if (!enabled || !sessionId) return;
    setLoading(true);
    fetchEmails().finally(() => setLoading(false));
  }, [enabled, sessionId, fetchEmails, setLoading]);

  // Set up polling
  usePolling(() => fetchEmails(), {
    interval: pollingInterval,
    enabled: enabled && !!sessionId,
    immediate: false, // Already fetched in initial effect
  });

  // Manual refetch function
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      await fetchEmails();
    } finally {
      setLoading(false);
    }
  }, [fetchEmails, setLoading]);

  return {
    emails,
    isLoading,
    isRefreshing,
    refetch,
    fetchEmails,
  };
}
