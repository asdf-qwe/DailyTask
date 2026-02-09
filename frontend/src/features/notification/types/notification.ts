// 알림 타입
export enum NotificationType {
  MEMO_SHARED = "MEMO_SHARED",
  TEAM_INVITATION = "TEAM_INVITATION",
  TEAM_MEMBER_JOINED = "TEAM_MEMBER_JOINED",
  SYSTEM = "SYSTEM",
}

// 알림 응답 DTO
export interface NotificationRes {
  id: number;
  type: NotificationType;
  message: string;
  relatedMemoId: number | null;
  relatedTeamId: number | null;
  read: boolean;
  createdAt: string; // ISO 8601 형식
}

// 성공 응답 DTO
export interface SuccessRes {
  success: boolean;
}
