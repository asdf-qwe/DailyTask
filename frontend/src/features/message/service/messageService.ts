import { authApi } from "@/src/features/auth/service/authService";
import { tokenStore } from "@/src/features/auth/service/authService";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { MessageRes, SendMessageDto } from "../types/message";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");
const API_PREFIX = "/api/v1/messages";

import { ApiResponse, ErrorResponse } from "../../../types/api";

class WebSocketClient {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();

  connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.client?.connected) {
        resolve();
        return;
      }

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
        beforeConnect: async () => {
          try {
            const freshToken = await tokenStore.ensureAccessToken();
            if (this.client) {
              this.client.connectHeaders = {
                Authorization: `Bearer ${freshToken}`,
              };
            }
          } catch {}
        },
        onConnect: () => {
          resolve();
        },
        onStompError: (frame) => {
          reject(new Error(frame.headers["message"]));
        },
        onWebSocketError: (error) => {
          reject(error);
        },
      });

      this.client.activate();
    });
  }

  disconnect(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions.clear();
    this.client?.deactivate();
    this.client = null;
  }

  subscribe(
    teamId: number,
    channelId: number,
    onMessage: (message: MessageRes) => void,
  ): () => void {
    const destination = `/topic/team/${teamId}/channel/${channelId}`;

    if (!this.client?.connected) {
      return () => {};
    }

    const existingSub = this.subscriptions.get(destination);
    if (existingSub) {
      existingSub.unsubscribe();
    }

    const subscription = this.client.subscribe(
      destination,
      (message: IMessage) => {
        try {
          const messageRes: MessageRes = JSON.parse(message.body);
          onMessage(messageRes);
        } catch {}
      },
    );

    this.subscriptions.set(destination, subscription);

    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };
  }

  sendMessage(
    teamId: number,
    channelId: number,
    messageDto: SendMessageDto,
  ): void {
    if (!this.client?.connected) {
      return;
    }

    this.client.publish({
      destination: `/app/team/${teamId}/channel/${channelId}`,
      body: JSON.stringify(messageDto),
    });
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

const wsClient = new WebSocketClient();

export const messageService = {
  getChatHistory: async (
    channelId: number,
  ): Promise<ApiResponse<MessageRes[]>> => {
    try {
      const response = await authApi.get<ApiResponse<MessageRes[]>>(
        `${API_PREFIX}/channel/${channelId}`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data as ErrorResponse;
      }
      throw error;
    }
  },

  connectWebSocket: async (): Promise<void> => {
    return wsClient.connect();
  },

  disconnectWebSocket: (): void => {
    wsClient.disconnect();
  },

  subscribeToChannel: (
    teamId: number,
    channelId: number,
    onMessage: (message: MessageRes) => void,
  ): (() => void) => {
    return wsClient.subscribe(teamId, channelId, onMessage);
  },

  sendMessage: (
    teamId: number,
    channelId: number,
    messageDto: SendMessageDto,
  ): void => {
    wsClient.sendMessage(teamId, channelId, messageDto);
  },

  isWebSocketConnected: (): boolean => {
    return wsClient.isConnected();
  },
};
