/**
 * Axios HTTP client instance with base configuration
 * Handles all API requests to the Cloudflare Worker backend
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type { ApiError, NewSessionResponse, InboxResponse } from '@/types';

// Get API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tempmail.example.com';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'temp-mail-web',
      },
    });

    // Add request interceptor to include session token
    this.axiosInstance.interceptors.request.use((config) => {
      const sessionId = typeof window !== 'undefined' 
        ? localStorage.getItem('temp_mail_session_id')
        : null;

      if (sessionId && config.headers) {
        config.headers.Authorization = `Bearer ${sessionId}`;
      }

      return config;
    });

    // Add response error interceptor for consistent error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        // Re-throw with consistent error structure
        if (error.response?.data) {
          return Promise.reject(error.response.data);
        }
        return Promise.reject({
          statusCode: error.response?.status || 500,
          message: error.message || 'Unknown error occurred',
        } as ApiError);
      }
    );
  }

  /**
   * Create a new temporary mail session
   */
  async createNewSession(): Promise<NewSessionResponse> {
    const response = await this.axiosInstance.post<NewSessionResponse>('/api/new_session');
    return response.data;
  }

  /**
   * Fetch inbox emails for current session
   */
  async getInbox(sessionId: string): Promise<InboxResponse> {
    const response = await this.axiosInstance.get<InboxResponse>('/api/inbox', {
      params: { sessionId },
    });
    return response.data;
  }

  /**
   * Get details of a specific email
   */
  async getEmailDetail(emailId: string): Promise<any> {
    const response = await this.axiosInstance.get(`/api/email/${emailId}`);
    return response.data;
  }

  /**
   * Delete an email
   */
  async deleteEmail(emailId: string): Promise<void> {
    await this.axiosInstance.delete(`/api/email/${emailId}`);
  }

  /**
   * Refresh/extend session expiration
   */
  async refreshSession(sessionId: string): Promise<NewSessionResponse> {
    const response = await this.axiosInstance.post<NewSessionResponse>('/api/refresh_session', {
      sessionId,
    });
    return response.data;
  }

  /**
   * Generic GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * Generic POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
