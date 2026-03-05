import { authApi } from "@/src/features/auth/service/authService";
import {
  CreateTeamRequest,
  CreateTeamResponse,
  CreateInviteCodeRequest,
  InviteCodeResponse,
  JoinTeamRequest,
  JoinTeamResponse,
  UpdateTeamReq,
  UpdateTeamRes,
  TeamMemberListRes,
  GetTeamRes,
} from "../types/team";

// API 기본 URL
const API_PREFIX = "/api/v1/teams";

import { ApiResponse, ErrorResponse } from "../../../types/api";

/**
 * 팀 서비스
 */
export const teamService = {
  /**
   * 내 팀 목록 조회
   */
  getTeam: async (): Promise<ApiResponse<GetTeamRes[]>> => {
    try {
      const response = await authApi.get<ApiResponse<GetTeamRes[]>>(API_PREFIX);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data as ErrorResponse;
      }
      throw error;
    }
  },

  /**
   * 팀 생성
   */
  createTeam: async (
    request: CreateTeamRequest,
  ): Promise<ApiResponse<CreateTeamResponse>> => {
    try {
      const response = await authApi.post<ApiResponse<CreateTeamResponse>>(
        API_PREFIX,
        request,
      );
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data as ErrorResponse;
      }
      throw error;
    }
  },

  /**
   * 초대 코드 생성
   */
  createInviteCode: async (
    teamId: number,
    request: CreateInviteCodeRequest,
  ): Promise<ApiResponse<InviteCodeResponse>> => {
    try {
      const response = await authApi.post<ApiResponse<InviteCodeResponse>>(
        `${API_PREFIX}/${teamId}/invite-code`,
        request,
      );
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data as ErrorResponse;
      }
      throw error;
    }
  },

  /**
   * 팀 가입 (초대 코드로)
   */
  joinTeam: async (
    request: JoinTeamRequest,
  ): Promise<ApiResponse<JoinTeamResponse>> => {
    try {
      const response = await authApi.post<ApiResponse<JoinTeamResponse>>(
        `${API_PREFIX}/join`,
        request,
      );
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data as ErrorResponse;
      }
      throw error;
    }
  },

  /**
   * 팀 정보 수정
   */
  updateTeam: async (
    teamId: number,
    request: UpdateTeamReq,
  ): Promise<ApiResponse<UpdateTeamRes>> => {
    try {
      const response = await authApi.put<ApiResponse<UpdateTeamRes>>(
        `${API_PREFIX}/${teamId}`,
        request,
      );
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data as ErrorResponse;
      }
      throw error;
    }
  },

  /**
   * 팀 나가기
   */
  leaveTeam: async (teamId: number): Promise<ApiResponse<boolean>> => {
    try {
      const response = await authApi.patch<ApiResponse<boolean>>(
        `${API_PREFIX}/${teamId}/leave`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data as ErrorResponse;
      }
      throw error;
    }
  },

  /**
   * 팀 멤버 목록 조회
   */
  getTeamMembers: async (
    teamId: number,
  ): Promise<ApiResponse<TeamMemberListRes[]>> => {
    try {
      const response = await authApi.get<ApiResponse<TeamMemberListRes[]>>(
        `${API_PREFIX}/${teamId}/members`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data as ErrorResponse;
      }
      throw error;
    }
  },

  /**
   * 팀 삭제 (OWNER 전용, soft delete)
   */
  deleteTeam: async (teamId: number): Promise<ApiResponse<boolean>> => {
    try {
      const response = await authApi.patch<ApiResponse<boolean>>(
        `${API_PREFIX}/${teamId}`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data as ErrorResponse;
      }
      throw error;
    }
  },

  /**
   * 팀 멤버 삭제 (강퇴)
   */
  deleteMember: async (
    teamId: number,
    memberId: number,
  ): Promise<ApiResponse<boolean>> => {
    try {
      const response = await authApi.patch<ApiResponse<boolean>>(
        `${API_PREFIX}/${teamId}/members/${memberId}`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data as ErrorResponse;
      }
      throw error;
    }
  },
};
