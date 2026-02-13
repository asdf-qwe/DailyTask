import { authApi } from "@/src/features/auth/service/authService";
import { NotificationRes, SuccessRes } from "../types/notification";

// API 기본 URL
const API_PREFIX = "/api/v1";

// API 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

/**
 * 알림 서비스
 */
export const notificationService = {
  /**
   * 알림 목록 조회
   */
  getNotifications: async (
    onlyUnread?: boolean,
  ): Promise<ApiResponse<NotificationRes[]>> => {
    const params = onlyUnread !== undefined ? { onlyUnread } : {};
    const response = await authApi.get<ApiResponse<NotificationRes[]>>(
      `${API_PREFIX}/notifications`,
      { params },
    );
    return response.data;
  },

  /**
   * 알림 읽음 처리
   */
  markAsRead: async (id: number): Promise<ApiResponse<SuccessRes>> => {
    const response = await authApi.patch<ApiResponse<SuccessRes>>(
      `${API_PREFIX}/notifications/${id}/read`,
    );
    return response.data;
  },
};
