import axios, { AxiosResponse, AxiosError } from "axios";
import {
  LoginRequestDto,
  SignupRequestDto,
  TokenResponseDto,
  UserResponseDto,
} from "../types/auth";

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_PREFIX = "/api/v1/users";

// Axios 인스턴스 생성
const authApi = axios.create({
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
authApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 인증 실패 시 처리
      console.error("Authentication failed");
    }
    return Promise.reject(error);
  }
);

/**
 * 인증 서비스
 */
export const authService = {
  /**
   * 회원가입
   */
  signup: async (
    request: SignupRequestDto
  ): Promise<ApiResponse<UserResponseDto>> => {
    const response = await authApi.post<ApiResponse<UserResponseDto>>(
      `${API_PREFIX}/signup`,
      request
    );
    return response.data;
  },

  /**
   * 이메일 중복 확인
   */
  checkEmail: async (email: string): Promise<ApiResponse<string>> => {
    const response = await authApi.get<ApiResponse<string>>(
      `${API_PREFIX}/check-email`,
      {
        params: { email },
      }
    );
    return response.data;
  },

  /**
   * 로그인 ID 중복 확인
   */
  checkLoginId: async (loginId: string): Promise<ApiResponse<string>> => {
    const response = await authApi.get<ApiResponse<string>>(
      `${API_PREFIX}/check-loginId`,
      {
        params: { loginId },
      }
    );
    return response.data;
  },

  /**
   * 로그인
   * 쿠키에 토큰이 자동으로 저장됨 (HttpOnly)
   */
  login: async (
    request: LoginRequestDto
  ): Promise<ApiResponse<TokenResponseDto>> => {
    const response = await authApi.post<ApiResponse<TokenResponseDto>>(
      `${API_PREFIX}/login`,
      request
    );
    return response.data;
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<ApiResponse<string>> => {
    const response = await authApi.post<ApiResponse<string>>(
      `${API_PREFIX}/logout`
    );
    return response.data;
  },

  /**
   * 토큰 갱신
   */
  refreshToken: async (): Promise<ApiResponse<TokenResponseDto>> => {
    const response = await authApi.post<ApiResponse<TokenResponseDto>>(
      `${API_PREFIX}/refresh`
    );
    return response.data;
  },

  /**
   * 내 프로필 조회
   */
  getMyProfile: async (): Promise<ApiResponse<UserResponseDto>> => {
    const response = await authApi.get<ApiResponse<UserResponseDto>>(
      `${API_PREFIX}/me`
    );
    return response.data;
  },
};

// Axios 인스턴스도 export (다른 곳에서 사용할 수 있도록)
export { authApi };
