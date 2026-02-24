export enum Role {
  OWNER = "OWNER",
  MEMBER = "MEMBER",
}

export interface CreateInviteCodeRequest {
  expiresInHours: number;
}

export interface InviteCodeResponse {
  inviteCode: string;
  expiresAt: string;
}

export interface CreateTeamRequest {
  name: string;
  description: string;
}

export interface CreateTeamResponse {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  createdAt: string;
}

export interface JoinTeamRequest {
  inviteCode: string;
}

export interface JoinTeamResponse {
  teamId: number;
  teamName: string;
  role: Role;
}

export interface TeamMemberListRes {
  memberId: number;
  userId: number;
  name: string;
  email: string;
  role: Role;
}

export interface UpdateTeamReq {
  name: string;
  description: string;
}

export interface UpdateTeamRes {
  id: number;
  name: string;
  description: string;
  updatedAt: string;
}

export interface GetTeamRes {
  teamId: number;
  name: string;
  memberCount: number;
}
