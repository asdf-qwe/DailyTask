export enum NotificationType {
  CHANNEL_MESSAGE = "CHANNEL_MESSAGE"
}

export interface NotificationRes {
  id: number;
  type: NotificationType;
  message: string;
  relatedChannelId: number | null;
  relatedTeamId: number | null;
  read: boolean;
  createdAt: string;
}

export interface SuccessRes {
  success: boolean;
}
