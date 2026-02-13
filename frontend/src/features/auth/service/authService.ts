import axios, { AxiosResponse, AxiosError } from "axios";
import {
  LoginRequestDto,
  SignupRequestDto,
  TokenResponseDto,
  UserResponseDto,
} from "../types/auth";

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const AUTH_PREFIX = "/api/v1/auth";
const USER_PREFIX = "/api/v1/users";

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

// 토큰 갱신 중 여부를 추적하는 변수
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// 응답 인터셉터 (에러 처리 및 자동 토큰 갱신)
authApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // 401 에러 발생 시 토큰 갱신 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("🔒 401 에러 발생 - 토큰 갱신 시도", originalRequest.url);

      if (isRefreshing) {
        console.log("⏳ 이미 토큰 갱신 중 - 대기열에 추가");
        // 이미 토큰 갱신 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return authApi(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🔄 Refresh Token 요청 중...");
        await authApi.post(`${AUTH_PREFIX}/refresh`);
        console.log("✅ 토큰 갱신 성공");

        processQueue(null);
        isRefreshing = false;

        // 원래 요청 재시도
        return authApi(originalRequest);
      } catch (refreshError: any) {
        console.error(
          "❌ 토큰 갱신 실패:",
          refreshError.response?.status,
          refreshError.response?.data,
        );
        console.error("🍪 현재 쿠키:", document.cookie);

        processQueue(refreshError as Error);
        isRefreshing = false;

        // 로그인 페이지로 리다이렉트 (클라이언트 사이드에서만)
        if (typeof window !== "undefined") {
          console.warn("🚪 로그인 페이지로 이동");
          window.location.href = "/auth/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

/**
 * 인증 서비스
 */
export const authService = {
  /**
   * 회원가입
   */
  signup: async (
    request: SignupRequestDto,
  ): Promise<ApiResponse<UserResponseDto>> => {
    const response = await authApi.post<ApiResponse<UserResponseDto>>(
      `${USER_PREFIX}/signup`,
      request,
    );
    return response.data;
  },

  /**
   * 이메일 중복 확인
   */
  checkEmail: async (email: string): Promise<ApiResponse<string>> => {
    const response = await authApi.get<ApiResponse<string>>(
      `${USER_PREFIX}/check-email`,
      {
        params: { email },
      },
    );
    return response.data;
  },

  /**
   * 로그인 ID 중복 확인
   */
  checkLoginId: async (loginId: string): Promise<ApiResponse<string>> => {
    const response = await authApi.get<ApiResponse<string>>(
      `${USER_PREFIX}/check-loginId`,
      {
        params: { loginId },
      },
    );
    return response.data;
  },

  /**
   * 로그인
   * 쿠키에 토큰이 자동으로 저장됨 (HttpOnly)
   */
  login: async (
    request: LoginRequestDto,
  ): Promise<ApiResponse<TokenResponseDto>> => {
    const response = await authApi.post<ApiResponse<TokenResponseDto>>(
      `${AUTH_PREFIX}/login`,
      request,
    );
    return response.data;
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<ApiResponse<string>> => {
    const response = await authApi.post<ApiResponse<string>>(
      `${AUTH_PREFIX}/logout`,
    );
    return response.data;
  },

  /**
   * 토큰 갱신
   */
  refreshToken: async (): Promise<ApiResponse<TokenResponseDto>> => {
    const response = await authApi.post<ApiResponse<TokenResponseDto>>(
      `${AUTH_PREFIX}/refresh`,
    );
    return response.data;
  },

  /**
   * 내 프로필 조회
   */
  getMyProfile: async (): Promise<ApiResponse<UserResponseDto>> => {
    const response = await authApi.get<ApiResponse<UserResponseDto>>(
      `${AUTH_PREFIX}/me`,
    );
    return response.data;
  },
};

// Axios 인스턴스도 export (다른 곳에서 사용할 수 있도록)
export { authApi };
