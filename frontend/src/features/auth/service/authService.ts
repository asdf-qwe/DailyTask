import axios, { AxiosResponse, AxiosError } from "axios";
import {
  LoginRequestDto,
  SignupRequestDto,
  TokenResponseDto,
  UserResponseDto,
} from "../types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const AUTH_PREFIX = "/api/v1/auth";
const USER_PREFIX = "/api/v1/users";

const authApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

import { ApiResponse, ErrorResponse } from "../../../types/api";

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

authApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
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
        const refreshResponse = await authApi.post<
          ApiResponse<TokenResponseDto>
        >(`${AUTH_PREFIX}/refresh`);
        if (refreshResponse.data.data?.accessToken) {
          tokenStore.setToken(refreshResponse.data.data.accessToken);
        }

        processQueue(null);
        isRefreshing = false;

        return authApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        isRefreshing = false;

        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const authService = {
  signup: async (
    request: SignupRequestDto,
  ): Promise<ApiResponse<UserResponseDto>> => {
    const response = await authApi.post<ApiResponse<UserResponseDto>>(
      `${USER_PREFIX}/signup`,
      request,
    );
    return response.data;
  },

  checkEmail: async (email: string): Promise<ApiResponse<string>> => {
    const response = await authApi.get<ApiResponse<string>>(
      `${USER_PREFIX}/check-email`,
      {
        params: { email },
      },
    );
    return response.data;
  },

  checkLoginId: async (loginId: string): Promise<ApiResponse<string>> => {
    const response = await authApi.get<ApiResponse<string>>(
      `${USER_PREFIX}/check-loginId`,
      {
        params: { loginId },
      },
    );
    return response.data;
  },

  login: async (
    request: LoginRequestDto,
  ): Promise<ApiResponse<TokenResponseDto>> => {
    const response = await authApi.post<ApiResponse<TokenResponseDto>>(
      `${AUTH_PREFIX}/login`,
      request,
    );
    return response.data;
  },

  logout: async (): Promise<ApiResponse<string>> => {
    const response = await authApi.post<ApiResponse<string>>(
      `${AUTH_PREFIX}/logout`,
    );
    return response.data;
  },

  refreshToken: async (): Promise<ApiResponse<TokenResponseDto>> => {
    const response = await authApi.post<ApiResponse<TokenResponseDto>>(
      `${AUTH_PREFIX}/refresh`,
    );
    if (response.data.data?.accessToken) {
      tokenStore.setToken(response.data.data.accessToken);
    }
    return response.data;
  },

  getMyProfile: async (): Promise<ApiResponse<UserResponseDto>> => {
    const response = await authApi.get<ApiResponse<UserResponseDto>>(
      `${AUTH_PREFIX}/me`,
    );
    return response.data;
  },
};

export { authApi };

let _accessToken: string | null = null;

const decodeJwtPayload = (token: string): { exp?: number } | null => {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length < 2) return null;

    const normalizedBase64 = tokenParts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const paddingLength = (4 - (normalizedBase64.length % 4)) % 4;
    const base64Payload = normalizedBase64.padEnd(
      normalizedBase64.length + paddingLength,
      "=",
    );

    const decode =
      typeof window !== "undefined" && typeof window.atob === "function"
        ? window.atob
        : typeof atob === "function"
          ? atob
          : null;

    if (!decode) return null;

    const payloadText = decode(base64Payload);
    return JSON.parse(payloadText) as { exp?: number };
  } catch {
    return null;
  }
};

export const tokenStore = {
  getToken: (): string | null => _accessToken,
  getTokenExpiryMs: (): number | null => {
    if (!_accessToken) return null;
    const payload = decodeJwtPayload(_accessToken);
    if (!payload || typeof payload.exp !== "number") return null;
    return payload.exp * 1000;
  },
  setToken: (token: string | null): void => {
    _accessToken = token;
  },

  ensureAccessToken: async (): Promise<string> => {
    if (_accessToken) return _accessToken;

    try {
      const response = await authApi.post<ApiResponse<TokenResponseDto>>(
        `${AUTH_PREFIX}/refresh`,
      );
      if (response.data.data?.accessToken) {
        _accessToken = response.data.data.accessToken;
        return _accessToken;
      }
    } catch {}
    throw new Error("No valid access token available");
  },
};
