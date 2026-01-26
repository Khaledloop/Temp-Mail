import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiError, NewSessionResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tempmail.example.com';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

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

  async createNewSession(): Promise<NewSessionResponse> {
    const response = await this.axiosInstance.post<any>('/api/new_session');
    return {
      sessionId: response.data.token,
      tempMailAddress: response.data.email,
      expiresAt: Date.now() + 86400000
    } as any; 
  }

  // الإصلاح هنا: نرجع any[] لنتوافق مع الـ Store
  async getInbox(email: string): Promise<any[]> {
    const response = await this.axiosInstance.get<any[]>('/api/inbox', {
      params: { email: email }, 
    });
    return response.data;
  }

  async refreshSession(sessionId: string): Promise<any> {
     return this.createNewSession();
  }
}

export const apiClient = new ApiClient();
export default apiClient;