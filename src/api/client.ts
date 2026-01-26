import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiError, NewSessionResponse } from '@/types';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tempmail.example.com';

// Backend session TTL in seconds (24 hours)
const SESSION_TTL_SECONDS = 86400;

interface BackendNewSessionResponse {
  token: string;
  email: string;
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
      '/api/new_session'
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
  async getInbox(): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get<any[]>('/api/inbox');
      // Ensure we return an array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching inbox:', error);
      return [];
    }
  }

  /**
   * Fetch a single message by ID
   * 
   * Returns full message object with: id, from, subject, timestamp, body
   */
  async getMessage(messageId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/api/message/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  }

  /**
   * Refresh session (creates a new one if expired)
   */
  async refreshSession(): Promise<NewSessionResponse> {
    return this.createNewSession();
  }
}

export const apiClient = new ApiClient();
export default apiClient;