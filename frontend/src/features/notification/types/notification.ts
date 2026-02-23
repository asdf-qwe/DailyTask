// 알림 타입
export enum NotificationType {
  CHANNEL_MESSAGE = "CHANNEL_MESSAGE"
}

// 알림 응답 DTO
export interface NotificationRes {
  id: number;
  type: NotificationType;
  message: string;
  relatedChannelId: number | null;
  relatedTeamId: number | null;
  read: boolean;
  createdAt: string; // ISO 8601 형식
}

// 성공 응답 DTO
export interface SuccessRes {
  success: boolean;
}
