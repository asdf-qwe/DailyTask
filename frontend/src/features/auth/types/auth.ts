export interface LoginRequestDto {
  loginId: string;
  password: string;
}

export interface SignupRequestDto {
  loginId: string;
  password: string;
  email: string;
  nickname: string;
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
}

export enum Status {
  ACTIVE = "ACTIVE",
  DELETED = "DELETED",
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface UserResponseDto {
  id: number;
  email: string;
  nickname: string;
  role: UserRole;
}

export interface LoginResponseDto {
  token: TokenResponseDto;
  user: UserResponseDto;
}

export interface AuthUser extends UserResponseDto {
  accessToken?: string;
  refreshToken?: string;
}
