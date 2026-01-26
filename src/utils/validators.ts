/**
 * Input validation utilities
 */

/**
 * Check if session token is still valid (not expired)
 */
export function isSessionValid(createdAt: string, ttl: number): boolean {
  try {
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    return now - created < ttl;
  } catch {
    return false;
  }
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate session ID format (basic check)
 */
export function isValidSessionId(sessionId: string): boolean {
  return !!(sessionId && sessionId.length > 0 && sessionId.length < 1000);
}

/**
 * Check if API response has expected structure
 */
export function isValidApiResponse<T extends Record<string, unknown>>(
  data: unknown,
  requiredFields: (keyof T)[]
): data is T {
  if (!data || typeof data !== 'object') return false;
  const record = data as Record<string, unknown>;
  return requiredFields.every((field) => field in record);
}
