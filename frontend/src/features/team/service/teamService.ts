import axios, { AxiosResponse, AxiosError } from "axios";
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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_PREFIX = "/api/v1/teams";

// Axios 인스턴스 생성
const teamApi = axios.create({
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
teamApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error("Authentication failed");
    }
    return Promise.reject(error);
  },
);

/**
 * 팀 서비스
 */
export const teamService = {
  /**
   * 내 팀 목록 조회
   */
  getTeam: async (): Promise<ApiResponse<GetTeamRes[]>> => {
    const response = await teamApi.get<ApiResponse<GetTeamRes[]>>(API_PREFIX);
    return response.data;
  },

  /**
   * 팀 생성
   */
  createTeam: async (
    request: CreateTeamRequest,
  ): Promise<ApiResponse<CreateTeamResponse>> => {
    const response = await teamApi.post<ApiResponse<CreateTeamResponse>>(
      API_PREFIX,
      request,
    );
    return response.data;
  },

  /**
   * 초대 코드 생성
   */
  createInviteCode: async (
    teamId: number,
    request: CreateInviteCodeRequest,
  ): Promise<ApiResponse<InviteCodeResponse>> => {
    const response = await teamApi.post<ApiResponse<InviteCodeResponse>>(
      `${API_PREFIX}/${teamId}/invite-code`,
      request,
    );
    return response.data;
  },

  /**
   * 팀 가입 (초대 코드로)
   */
  joinTeam: async (
    request: JoinTeamRequest,
  ): Promise<ApiResponse<JoinTeamResponse>> => {
    const response = await teamApi.post<ApiResponse<JoinTeamResponse>>(
      `${API_PREFIX}/join`,
      request,
    );
    return response.data;
  },

  /**
   * 팀 정보 수정
   */
  updateTeam: async (
    teamId: number,
    request: UpdateTeamReq,
  ): Promise<ApiResponse<UpdateTeamRes>> => {
    const response = await teamApi.put<ApiResponse<UpdateTeamRes>>(
      `${API_PREFIX}/${teamId}`,
      request,
    );
    return response.data;
  },

  /**
   * 팀 나가기
   */
  leaveTeam: async (teamId: number): Promise<ApiResponse<boolean>> => {
    const response = await teamApi.patch<ApiResponse<boolean>>(
      `${API_PREFIX}/${teamId}/leave`,
    );
    return response.data;
  },

  /**
   * 팀 멤버 목록 조회
   */
  getTeamMembers: async (
    teamId: number,
  ): Promise<ApiResponse<TeamMemberListRes[]>> => {
    const response = await teamApi.get<ApiResponse<TeamMemberListRes[]>>(
      `${API_PREFIX}/${teamId}/members`,
    );
    return response.data;
  },

  /**
   * 팀 멤버 삭제 (강퇴)
   */
  deleteMember: async (
    teamId: number,
    memberId: number,
  ): Promise<ApiResponse<boolean>> => {
    const response = await teamApi.patch<ApiResponse<boolean>>(
      `${API_PREFIX}/${teamId}/members/${memberId}`,
    );
    return response.data;
  },
};
