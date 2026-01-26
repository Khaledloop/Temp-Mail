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
}

export function usePolling(
  callback: () => Promise<void>,
  options: UsePollingOptions
): void {
  const { interval, enabled = true, immediate = true, onError } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const executePolling = async () => {
      try {
        await callback();
      } catch (error) {
        console.error('Polling error:', error);
        if (onError && error instanceof Error) {
          onError(error);
        }
      }
    };

    // Execute immediately if enabled
    if (immediate) {
      executePolling();
    }

    // Set up interval
    intervalRef.current = setInterval(executePolling, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [callback, interval, enabled, immediate, onError]);
}
