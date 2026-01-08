// 팀원 역할
export enum Role {
  OWNER = "OWNER",
  MEMBER = "MEMBER",
}

// 초대 코드 생성 요청
export interface CreateInviteCodeRequest {
  expiresInHours: number;
}

// 초대 코드 응답
export interface InviteCodeResponse {
  inviteCode: string;
  expiresAt: string; // LocalDateTime -> ISO 8601 문자열
}

// 팀 생성 요청
export interface CreateTeamRequest {
  name: string;
  description: string;
}

// 팀 생성 응답
export interface CreateTeamResponse {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  createdAt: string; // LocalDateTime -> ISO 8601 문자열
}

// 팀 가입 요청
export interface JoinTeamRequest {
  inviteCode: string;
}

// 팀 가입 응답
export interface JoinTeamResponse {
  teamId: number;
  teamName: string;
  role: Role;
}

// 팀 멤버 목록 응답
export interface TeamMemberListRes {
  memberId: number;
  userId: number;
  name: string;
  email: string;
  role: Role;
}

// 팀 정보 수정 요청
export interface UpdateTeamReq {
  name: string;
  description: string;
}

// 팀 정보 수정 응답
export interface UpdateTeamRes {
  id: number;
  name: string;
  description: string;
  updatedAt: string; // LocalDateTime -> ISO 8601 문자열
}

// 내 팀 목록 조회 응답
export interface GetTeamRes {
  teamId: number;
  name: string;
  memberCount: number; // 추가
}
