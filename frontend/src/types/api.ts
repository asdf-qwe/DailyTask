// 공통 API 응답 타입 정의
export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface ErrorResponse {
  errorCode: string;
  message: string;
  path: string;
  timestamp: string;
}
