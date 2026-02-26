import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiError, Email, NewSessionResponse } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useInboxStore } from '@/store/inboxStore';
import { getFallbackDomains } from '@/utils/domains';
import { API_ENDPOINTS } from '@/utils/constants';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tempmail.example.com';

// Backend session TTL in seconds (30 days)
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

interface BackendNewSessionResponse {
  token: string;
  email: string;
}

interface DomainsResponse {
  domains: string[];
}

interface RecoveryKeyResponse {
  key: string;
  email: string;
  createdAt?: string;
}

interface ChangeEmailRequest {
  localPart?: string;
  domain?: string;
  random?: boolean;
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    /**
     * Request Interceptor: Attach Bearer Token from Zustand store
     * 
     * Why it works now:
     * - Uses useAuthStore.getState() to synchronously read current state
     * - Zustand persists state to localStorage automatically
     * - Even if component hasn't mounted yet, persisted state is available
     */
    this.axiosInstance.interceptors.request.use((config) => {
      try {
        // Get sessionId from Zustand store (which is hydrated from localStorage)
        const sessionId = useAuthStore.getState().sessionId;

        if (sessionId && config.headers) {
          config.headers.Authorization = `Bearer ${sessionId}`;
        }
      } catch (error) {
        // Fail silently if store not ready yet
        console.debug('Store not ready for auth interceptor:', error);
      }

      return config;
    });

    /**
     * Response Interceptor: Handle errors consistently
     */
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        const status = error.response?.status;
        if (status === 401) {
          try {
            useAuthStore.getState().clearSession();
            useInboxStore.getState().clearInbox();
          } catch (clearError) {
            console.debug('Failed to clear session after 401:', clearError);
          }
        }
        if (error.response?.data) return Promise.reject(error.response.data);
        return Promise.reject({
          statusCode: error.response?.status || 500,
          message: error.message || 'Unknown error occurred',
        } as ApiError);
      }
    );
  }

  /**
   * Create a new temporary email session
   * 
   * Backend returns: { token, email }
   * Frontend maps to: { sessionId, tempMailAddress, expiresAt }
   */
  async createNewSession(): Promise<NewSessionResponse> {
    const response = await this.axiosInstance.post<BackendNewSessionResponse>(
      API_ENDPOINTS.NEW_SESSION
    );

    const expiresAt = new Date(
      Date.now() + SESSION_TTL_SECONDS * 1000
    ).toISOString();

    return {
      sessionId: response.data.token,
      tempMailAddress: response.data.email,
      expiresAt,
    };
  }

  /**
   * Fetch emails from inbox for current session
   * 
   * Authorization header is automatically added by interceptor
   * Returns array of messages with: id, from, subject, timestamp, body
   */
  async getInbox(): Promise<Email[]> {
    const response = await this.axiosInstance.get<Email[]>(API_ENDPOINTS.INBOX);
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Fetch a single message by ID
   * 
   * Returns full message object with: id, from, subject, timestamp, body
   */
  async getMessage(messageId: string): Promise<Email> {
    try {
      const response = await this.axiosInstance.get(API_ENDPOINTS.EMAIL_DETAIL(messageId));
      return response.data;
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  }

  /**
   * Delete a message by ID
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      await this.axiosInstance.delete(API_ENDPOINTS.DELETE_EMAIL(messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Refresh session (creates a new one if expired)
   */
  async refreshSession(): Promise<NewSessionResponse> {
    return this.createNewSession();
  }

  /**
   * Fetch available domains from backend
   */
  async getDomains(): Promise<string[]> {
    try {
      const response = await this.axiosInstance.get<DomainsResponse>('/api/domains');
      const domains = Array.isArray(response.data?.domains) ? response.data.domains : [];
      return domains.length ? domains : getFallbackDomains();
    } catch (error) {
      console.error('Error fetching domains:', error);
      return getFallbackDomains();
    }
  }

  /**
   * Change current email to a custom local part + domain
   */
  async changeEmail(payload: ChangeEmailRequest): Promise<NewSessionResponse> {
    const response = await this.axiosInstance.post<BackendNewSessionResponse>(
      '/api/change_email',
      payload
    );

    const expiresAt = new Date(
      Date.now() + SESSION_TTL_SECONDS * 1000
    ).toISOString();

    return {
      sessionId: response.data.token,
      tempMailAddress: response.data.email,
      expiresAt,
    };
  }

  /**
   * Get recovery key for current email
   */
  async getRecoveryKey(): Promise<RecoveryKeyResponse> {
    const response = await this.axiosInstance.get<RecoveryKeyResponse>(
      '/api/recovery/key'
    );
    return response.data;
  }

  /**
   * Recover email using recovery key
   */
  async recoverEmail(key: string): Promise<NewSessionResponse> {
    const response = await this.axiosInstance.post<BackendNewSessionResponse>(
      '/api/recovery/restore',
      { key }
    );

    const expiresAt = new Date(
      Date.now() + SESSION_TTL_SECONDS * 1000
    ).toISOString();

    return {
      sessionId: response.data.token,
      tempMailAddress: response.data.email,
      expiresAt,
    };
  }
}

export const apiClient = new ApiClient();
export default apiClient;
