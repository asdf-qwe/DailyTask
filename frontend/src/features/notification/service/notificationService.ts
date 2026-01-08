import axios, { AxiosResponse, AxiosError } from "axios";
import { NotificationRes, SuccessRes } from "../types/notification";

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_PREFIX = "/api/v1";

// Axios 인스턴스 생성
const notificationApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 전송을 위해 필요
  headers: {
    "Content-Type": "application/json",
  },
});

// API 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

// 응답 인터셉터 (에러 처리)
notificationApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error("Authentication failed");
    }
    return Promise.reject(error);
  }
);

/**
 * 알림 서비스
 */
export const notificationService = {
  /**
   * 알림 목록 조회
   */
  getNotifications: async (
    onlyUnread?: boolean
  ): Promise<ApiResponse<NotificationRes[]>> => {
    const params = onlyUnread !== undefined ? { onlyUnread } : {};
    const response = await notificationApi.get<ApiResponse<NotificationRes[]>>(
      `${API_PREFIX}/notifications`,
      { params }
    );
    return response.data;
  },

  /**
   * 알림 읽음 처리
   */
  markAsRead: async (id: number): Promise<ApiResponse<SuccessRes>> => {
    const response = await notificationApi.patch<ApiResponse<SuccessRes>>(
      `${API_PREFIX}/notifications/${id}/read`
    );
    return response.data;
  },
};
