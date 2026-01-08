import axios, { AxiosResponse, AxiosError } from "axios";
import { MessageRes, SendMessageDto } from "../types/message";

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_PREFIX = "/api/channel";

// Axios 인스턴스 생성
const messageApi = axios.create({
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
messageApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error("Authentication failed");
    }
    return Promise.reject(error);
  }
);

/**
 * 메시지 서비스
 */
export const messageService = {
  /**
   * 채팅 히스토리 조회
   */
  getChatHistory: async (
    channelId: number
  ): Promise<ApiResponse<MessageRes[]>> => {
    const response = await messageApi.get<ApiResponse<MessageRes[]>>(
      `${API_PREFIX}/${channelId}/messages`
    );
    return response.data;
  },

  /**
   * 메시지 전송
   * Note: 실제 구현에서는 WebSocket을 사용해야 하지만,
   * 여기서는 REST API 형태로 구현합니다.
   */
  sendMessage: async (
    channelId: number,
    messageDto: SendMessageDto
  ): Promise<void> => {
    // WebSocket 메시지 전송은 별도로 구현 필요
    // 현재는 placeholder
    console.log(`Sending message to channel ${channelId}:`, messageDto);
  },
};
