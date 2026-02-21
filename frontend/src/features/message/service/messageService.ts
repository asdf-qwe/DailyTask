import { authApi } from "@/src/features/auth/service/authService";
import { tokenStore } from "@/src/features/auth/service/authService";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { MessageRes, SendMessageDto } from "../types/message";

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");
const API_PREFIX = "/api/v1/messages";

// API 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

/**
 * WebSocket STOMP 클라이언트 관리
 */
class WebSocketClient {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();

  /**
   * WebSocket 연결
   */
  connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.client?.connected) {
        resolve();
        return;
      }

      // 연결 전 토큰 확보
      let token: string;
      try {
        token = await tokenStore.ensureAccessToken();
      } catch (error) {
        reject(error);
        return;
      }

      this.client = new Client({
        webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        // 재연결 시에도 최신 토큰으로 갱신
        beforeConnect: async () => {
          try {
            const freshToken = await tokenStore.ensureAccessToken();
            if (this.client) {
              this.client.connectHeaders = {
                Authorization: `Bearer ${freshToken}`,
              };
            }
          } catch (error) {
            console.error("Failed to refresh token before reconnect:", error);
          }
        },
        onConnect: () => {
          console.log("WebSocket connected");
          resolve();
        },
        onStompError: (frame) => {
          console.error("STOMP error:", frame);
          reject(new Error(frame.headers["message"]));
        },
        onWebSocketError: (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        },
      });

      this.client.activate();
    });
  }

  /**
   * WebSocket 연결 해제
   */
  disconnect(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions.clear();
    this.client?.deactivate();
    this.client = null;
  }

  /**
   * 채널 구독
   */
  subscribe(
    teamId: number,
    channelId: number,
    onMessage: (message: MessageRes) => void,
  ): () => void {
    const destination = `/topic/team/${teamId}/channel/${channelId}`;

    if (!this.client?.connected) {
      console.error("WebSocket not connected");
      return () => {};
    }

    // 기존 구독 해제
    const existingSub = this.subscriptions.get(destination);
    if (existingSub) {
      existingSub.unsubscribe();
    }

    // 새 구독 등록
    const subscription = this.client.subscribe(
      destination,
      (message: IMessage) => {
        try {
          const messageRes: MessageRes = JSON.parse(message.body);
          onMessage(messageRes);
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      },
    );

    this.subscriptions.set(destination, subscription);

    // 구독 해제 함수 반환
    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };
  }

  /**
   * 메시지 전송
   */
  sendMessage(
    teamId: number,
    channelId: number,
    messageDto: SendMessageDto,
  ): void {
    if (!this.client?.connected) {
      console.error("WebSocket not connected");
      return;
    }

    this.client.publish({
      destination: `/app/team/${teamId}/channel/${channelId}`,
      body: JSON.stringify(messageDto),
    });
  }

  /**
   * 연결 상태 확인
   */
  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

// WebSocket 클라이언트 싱글톤
const wsClient = new WebSocketClient();

/**
 * 메시지 서비스
 */
export const messageService = {
  /**
   * 채팅 히스토리 조회
   */
  getChatHistory: async (
    channelId: number,
  ): Promise<ApiResponse<MessageRes[]>> => {
    const response = await authApi.get<ApiResponse<MessageRes[]>>(
      `${API_PREFIX}/channel/${channelId}`,
    );
    return response.data;
  },

  /**
   * WebSocket 연결
   */
  connectWebSocket: async (): Promise<void> => {
    return wsClient.connect();
  },

  /**
   * WebSocket 연결 해제
   */
  disconnectWebSocket: (): void => {
    wsClient.disconnect();
  },

  /**
   * 채널 구독
   */
  subscribeToChannel: (
    teamId: number,
    channelId: number,
    onMessage: (message: MessageRes) => void,
  ): (() => void) => {
    return wsClient.subscribe(teamId, channelId, onMessage);
  },

  /**
   * 메시지 전송
   */
  sendMessage: (
    teamId: number,
    channelId: number,
    messageDto: SendMessageDto,
  ): void => {
    wsClient.sendMessage(teamId, channelId, messageDto);
  },

  /**
   * WebSocket 연결 상태 확인
   */
  isWebSocketConnected: (): boolean => {
    return wsClient.isConnected();
  },
};
