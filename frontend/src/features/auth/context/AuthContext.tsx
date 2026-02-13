"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/src/features/auth/service/authService";
import { UserResponseDto } from "@/src/features/auth/types/auth";

interface AuthContextType {
  user: UserResponseDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await authService.getMyProfile();
      if (response.success) {
        console.log(
          "👤 사용자 인증 상태 유지:",
          response.data.nickname || response.data.email,
        );
        setUser(response.data);
      }
    } catch (error: any) {
      console.error(
        "❌ 사용자 인증 실패:",
        error.response?.status,
        error.message,
      );
      if (error.response?.status === 401) {
        console.warn("🔓 인증 토큰 만료 - 로그아웃 처리");
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async () => {
    await fetchUser();
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
