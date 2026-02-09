import axios, { AxiosResponse, AxiosError } from "axios";
import {
  ChannelListRes,
  CreateChannelReq,
  CreateChannelRes,
} from "../types/channel";

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_PREFIX = "/api/v1/teams";

// Axios 인스턴스 생성
const channelApi = axios.create({
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
channelApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error("Authentication failed");
    }
    return Promise.reject(error);
  },
);

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
    const response = await channelApi.post<ApiResponse<CreateChannelRes>>(
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
    const response = await channelApi.get<ApiResponse<ChannelListRes[]>>(
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
    const response = await channelApi.delete<ApiResponse<boolean>>(
      `${API_PREFIX}/${teamId}/channels/${channelId}`,
    );
    return response.data;
  },
};
