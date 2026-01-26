import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiError, NewSessionResponse, InboxResponse } from '@/types';

// تأكد من قراءة رابط الوركر من البيئة
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

  // 1. إنشاء جلسة (مع الترجمة)
  async createNewSession(): Promise<NewSessionResponse> {
    // الوركر يرجع { email, token } لكننا نحتاج صيغة أخرى للواجهة
    const response = await this.axiosInstance.post<any>('/api/new_session');
    
    return {
      // هنا نقوم بالترجمة:
      sessionId: response.data.token,      // token -> sessionId
      tempMailAddress: response.data.email,// email -> tempMailAddress
      expiresAt: Date.now() + 86400000     // نضيف وقت انتهاء وهمي (24 ساعة)
    } as any; 
  }

  // 2. جلب الرسائل (إرسال الإيميل بدلاً من الجلسة)
  async getInbox(email: string): Promise<InboxResponse> {
    // الوركر يحتاج "email" كباراميتر
    const response = await this.axiosInstance.get<InboxResponse>('/api/inbox', {
      params: { email: email }, 
    });
    return response.data;
  }

  // دوال إضافية (اختياري)
  async refreshSession(sessionId: string): Promise<any> {
     // للتجديد نطلب جلسة جديدة وخلاص
     return this.createNewSession();
  }
}

export const apiClient = new ApiClient();
export default apiClient;