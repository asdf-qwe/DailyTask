import { authApi } from "@/src/features/auth/service/authService";
import {
  ChannelListRes,
  CreateChannelReq,
  CreateChannelRes,
} from "../types/channel";

// API 기본 URL
const API_PREFIX = "/api/v1/teams";

// API 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

/**
 * 채널 서비스
 */
export const channelService = {
  /**
   * 채널 생성
   */
  createChannel: async (
    teamId: number,
    request: CreateChannelReq,
  ): Promise<ApiResponse<CreateChannelRes>> => {
    const response = await authApi.post<ApiResponse<CreateChannelRes>>(
      `${API_PREFIX}/${teamId}/channels`,
      request,
    );
    return response.data;
  },

  /**
   * 채널 목록 조회
   */
  getChannels: async (
    teamId: number,
  ): Promise<ApiResponse<ChannelListRes[]>> => {
    const response = await authApi.get<ApiResponse<ChannelListRes[]>>(
      `${API_PREFIX}/${teamId}/channels`,
    );
    return response.data;
  },

  /**
   * 채널 삭제
   */
  deleteChannel: async (
    teamId: number,
    channelId: number,
  ): Promise<ApiResponse<boolean>> => {
    const response = await authApi.delete<ApiResponse<boolean>>(
      `${API_PREFIX}/${teamId}/channels/${channelId}`,
    );
    return response.data;
  },
};
