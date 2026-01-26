import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiError, NewSessionResponse } from '@/types';
// 👇 1. استيراد المخزن عشان نجيب منه التوكن صح
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tempmail.example.com';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    // 👇 2. إصلاح المصادقة هنا
    this.axiosInstance.interceptors.request.use((config) => {
      // بدل ما نقرأ من اللوكال ستوريج الغلط، ناخده من المخزن مباشرة
      const sessionId = useAuthStore.getState().sessionId;

      if (sessionId && config.headers) {
        config.headers.Authorization = `Bearer ${sessionId}`;
      }

      return config;
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