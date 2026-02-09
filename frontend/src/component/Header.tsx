"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, LogIn, X } from "lucide-react";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { notificationService } from "@/src/features/notification/service/notificationService";
import { NotificationRes } from "@/src/features/notification/types/notification";
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";

interface HeaderProps {
  currentPage?: "dashboard" | "memo" | "chat" | "todo" | "team";
}

export default function Header({ currentPage = "dashboard" }: HeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRes[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: "dashboard", label: "대시보드", href: "/" },
    { id: "memo", label: "메모", href: "/main/memo" },
    { id: "chat", label: "채팅", href: "/main/chat" },
    { id: "todo", label: "Todo", href: "/main/todo" },
    { id: "team", label: "팀", href: "/main/team" },
  ];

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/auth/login");
  }, [logout, router]);

  // 알림 목록 가져오기
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter((n) => !n.read).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [isAuthenticated]);

  // 알림 읽음 처리
  const handleMarkAsRead = useCallback(
    async (id: number) => {
      try {
        const response = await notificationService.markAsRead(id);
        if (response.success) {
          fetchNotifications();
        }
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    },
    [fetchNotifications],
  );

  // 알림 클릭 처리
  const handleNotificationClick = useCallback(
    (notification: NotificationRes) => {
      if (!notification.read) {
        handleMarkAsRead(notification.id);
      }

      // 관련 페이지로 이동
      if (notification.relatedMemoId) {
        router.push(`/main/memo`);
      } else if (notification.relatedTeamId) {
        router.push(`/main/team`);
      }

      setShowNotifications(false);
    },
    [handleMarkAsRead, router],
  );

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // 알림 목록 주기적으로 갱신 (60초로 변경하여 네트워크 요청 감소)
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // 60초마다
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);

  // 알림 타입별 메시지 색상
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "TEAM_INVITATION":
        return "text-blue-600";
      case "MEMO_SHARED":
        return "text-green-600";
      case "TEAM_MEMBER_JOINED":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">DailyTask</span>
            </Link>
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === item.id
                        ? "text-gray-900 bg-gray-100 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 hover:bg-gray-100 rounded-lg relative"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-white text-xs px-1">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* 알림 드롭다운 */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[400px] overflow-hidden z-50">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">알림</h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <div className="overflow-y-auto max-h-[340px]">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>알림이 없습니다</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() =>
                                  handleNotificationClick(notification)
                                }
                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  !notification.read ? "bg-blue-50" : ""
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                      !notification.read
                                        ? "bg-blue-500"
                                        : "bg-gray-300"
                                    }`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-sm ${
                                        !notification.read
                                          ? "font-medium text-gray-900"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(
                                        notification.createdAt,
                                      ).toLocaleString("ko-KR", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.nickname?.charAt(0) || user.loginId.charAt(0)}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-gray-900">
                      {user.nickname || user.loginId}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">로그아웃</span>
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
