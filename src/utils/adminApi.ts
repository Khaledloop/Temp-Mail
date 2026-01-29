export interface AdminRequestOptions {
  baseUrl: string;
  token?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '');
}

export async function adminRequest<T>(
  path: string,
  options: AdminRequestOptions
): Promise<T> {
  const baseUrl = normalizeBaseUrl(options.baseUrl || '');
  if (!baseUrl) {
    throw new Error('Admin API base URL is missing');
  }

  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers['x-admin-secret'] = options.token;
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || `Admin API error (${response.status})`);
  }

  return (await response.json()) as T;
}
