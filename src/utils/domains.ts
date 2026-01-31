/**
 * Domain helpers for change-email UI.
 * Uses env override when available, otherwise falls back to a safe default list.
 */

const DEFAULT_DOMAINS = [
  'chatgptmail.shop',
  'digibeast.store',
  'emailmuaqat.shop',
  'narsub.online',
  'narsub.shop',
  'thebest73.shop',
];

function parseEnvDomains(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function getFallbackDomains(): string[] {
  const fromEnv = parseEnvDomains(process.env.NEXT_PUBLIC_EMAIL_DOMAINS);
  return fromEnv.length ? fromEnv : DEFAULT_DOMAINS;
}

