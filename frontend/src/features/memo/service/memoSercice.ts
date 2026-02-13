import { authApi } from "@/src/features/auth/service/authService";
import {
  CreateMemoReq,
  CreateMemoRes,
  MemoListRes,
  MemoRes,
  MemoSearchCond,
  UpdateMemoReq,
  UpdateMemoRes,
} from "../types/memo";

// API 기본 URL
const API_PREFIX = "/api/v1";

// API 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

/**
 * 메모 서비스
 */
export const memoService = {
  /**
   * 메모 생성
   */
  createMemo: async (
    teamId: number,
    request: CreateMemoReq,
  ): Promise<ApiResponse<CreateMemoRes>> => {
    const response = await authApi.post<ApiResponse<CreateMemoRes>>(
      `${API_PREFIX}/teams/${teamId}/memos`,
      request,
    );
    return response.data;
  },

  /**
   * 메모 리스트 조회 (페이징 + 검색)
   */
  getMemoList: async (
    teamId: number,
    page: number = 0,
    size: number = 10,
    searchCond?: MemoSearchCond,
  ): Promise<ApiResponse<MemoListRes>> => {
    const params = {
      page,
      size,
      sort: "createdAt,desc",
      ...searchCond,
    };

    const response = await authApi.get<ApiResponse<MemoListRes>>(
      `${API_PREFIX}/teams/${teamId}/memos`,
      { params },
    );
    return response.data;
  },

  /**
   * 메모 상세 조회
   */
  getMemo: async (memoId: number): Promise<ApiResponse<MemoRes>> => {
    const response = await authApi.get<ApiResponse<MemoRes>>(
      `${API_PREFIX}/memos/${memoId}`,
    );
    return response.data;
  },

  /**
   * 메모 수정
   */
  updateMemo: async (
    memoId: number,
    request: UpdateMemoReq,
  ): Promise<ApiResponse<UpdateMemoRes>> => {
    const response = await authApi.patch<ApiResponse<UpdateMemoRes>>(
      `${API_PREFIX}/memos/${memoId}`,
      request,
    );
    return response.data;
  },

  /**
   * 메모 삭제
   */
  deleteMemo: async (memoId: number): Promise<ApiResponse<boolean>> => {
    const response = await authApi.delete<ApiResponse<boolean>>(
      `${API_PREFIX}/memos/${memoId}`,
    );
    return response.data;
  },
};
