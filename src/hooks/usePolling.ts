/**
 * Custom hook for polling API endpoints
 * Executes a function at regular intervals
 */

import { useEffect, useRef } from 'react';

interface UsePollingOptions {
  interval: number; // milliseconds
  enabled?: boolean;
  immediate?: boolean; // execute immediately on mount
  onError?: (error: Error) => void;
  resetSignal?: number;
}

export function usePolling(
  callback: () => Promise<void>,
  options: UsePollingOptions
): void {
  const { interval, enabled = true, immediate = true, onError, resetSignal = 0 } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const executePolling = async () => {
      try {
        await callbackRef.current();
      } catch (error) {
        console.error('Polling error:', error);
        if (onError && error instanceof Error) {
          onError(error);
        }
      }
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const startPolling = (runImmediate: boolean) => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      if (runImmediate) {
        executePolling();
      }

      intervalRef.current = setInterval(executePolling, interval);
    };

    const handleVisibilityChange = () => {
      if (typeof document === 'undefined') return;

      if (document.visibilityState === 'visible') {
        stopPolling();
        startPolling(true);
      } else {
        stopPolling();
      }
    };

    startPolling(immediate);

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      stopPolling();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [interval, enabled, immediate, onError, resetSignal]);
}
