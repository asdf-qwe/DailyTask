"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authService } from "@/src/features/auth/service/authService";
import { tokenStore } from "@/src/features/auth/service/authService";
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
  const lastRefreshSuccessAtRef = useRef<number>(0);
  const isRefreshingRef = useRef(false);

  const fetchUser = useCallback(async () => {
    try {
      const response = await authService.getMyProfile();
      if (response.data) {
        setUser(response.data);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const REFRESH_BUFFER_MS = 60 * 1000;
    const MIN_REFRESH_DELAY_MS = 30 * 1000;
    const FALLBACK_REFRESH_MS = 8 * 60 * 1000;
    const VISIBILITY_GUARD_MS = 3 * 60 * 1000;
    let timeoutId: number | null = null;

    const scheduleNextRefresh = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      const tokenExpiryMs = tokenStore.getTokenExpiryMs();
      const now = Date.now();

      const delayMs =
        tokenExpiryMs !== null
          ? Math.max(
              tokenExpiryMs - now - REFRESH_BUFFER_MS,
              MIN_REFRESH_DELAY_MS,
            )
          : FALLBACK_REFRESH_MS;

      timeoutId = window.setTimeout(() => {
        void refreshSession();
      }, delayMs);
    };

    const refreshSession = async () => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;

      try {
        const response = await authService.refreshToken();
        if (response.data?.accessToken) {
          tokenStore.setToken(response.data.accessToken);
          lastRefreshSuccessAtRef.current = Date.now();
          scheduleNextRefresh();
        }
      } catch {
        tokenStore.setToken(null);
        setUser(null);
      } finally {
        isRefreshingRef.current = false;
      }
    };

    if (tokenStore.getTokenExpiryMs() === null) {
      void refreshSession();
    } else {
      scheduleNextRefresh();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const elapsedSinceLastSuccess =
          Date.now() - lastRefreshSuccessAtRef.current;
        if (elapsedSinceLastSuccess < VISIBILITY_GUARD_MS) {
          return;
        }
        void refreshSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  const login = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      tokenStore.setToken(null);
      setUser(null);
    } catch {
      tokenStore.setToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
