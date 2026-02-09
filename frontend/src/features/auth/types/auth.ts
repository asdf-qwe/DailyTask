// 로그인 요청 DTO
export interface LoginRequestDto {
  loginId: string;
  password: string;
}

// 회원가입 요청 DTO
export interface SignupRequestDto {
  loginId: string;
  password: string;
  email: string;
  nickname: string;
}

// 토큰 응답 DTO
export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
}

// 사용자 상태
export enum Status {
  ACTIVE = "ACTIVE",
  DELETED = "DELETED",
}

// 사용자 역할
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

// 사용자 응답 DTO
export interface UserResponseDto {
  id: number;
  loginId: string;
  email: string;
  nickname: string;
  profileUrl?: string;
  status: Status;
  role: UserRole;
}

// 로그인 응답 (토큰 + 사용자 정보)
export interface LoginResponseDto {
  token: TokenResponseDto;
  user: UserResponseDto;
}

// 인증 컨텍스트용 사용자 정보
export interface AuthUser extends UserResponseDto {
  accessToken?: string;
  refreshToken?: string;
}
