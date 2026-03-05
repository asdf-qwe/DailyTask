import { authApi } from "@/src/features/auth/service/authService";
import { NotificationRes, SuccessRes } from "../types/notification";

// API 기본 URL
const API_PREFIX = "/api/v1";

// API 응답 타입
import { ApiResponse, ErrorResponse } from "../../../types/api";

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
    try {
      const params = onlyUnread !== undefined ? { onlyUnread } : {};
      const response = await authApi.get<ApiResponse<NotificationRes[]>>(
        `${API_PREFIX}/notifications`,
        { params },
      );
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data as ErrorResponse;
      }
      throw error;
    }
  },

  /**
   * 알림 읽음 처리
   */
  markAsRead: async (id: number): Promise<ApiResponse<SuccessRes>> => {
    try {
      const response = await authApi.patch<ApiResponse<SuccessRes>>(
        `${API_PREFIX}/notifications/${id}/read`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data as ErrorResponse;
      }
      throw error;
    }
  },
};
