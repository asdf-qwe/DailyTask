"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText,
  MessageSquare,
  CheckSquare,
  Search,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  AlertCircle,
  LogIn,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Header from "@/src/component/Header";
import QuickStats from "@/src/component/main/QuickStats";
import TeamSummary from "@/src/component/main/TeamSummary";
import RecentMemos from "@/src/component/main/RecentMemos";
import TodayTodos from "@/src/component/main/TodayTodos";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { useTeam } from "@/src/features/team/context/TeamContext";
import { memoService } from "@/src/features/memo/service/memoSercice";
import { RecentMemoRes } from "@/src/features/memo/types/memo";
import { CreateTeamResponse } from "@/src/features/team/types/team";
import { todoService } from "@/src/features/todo/service/todoService";
import { TodoSummary, TodoStatus } from "@/src/features/todo/types/todo";
import { notificationService } from "@/src/features/notification/service/notificationService";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { teams: cachedTeams } = useTeam();
  const [recentMemos, setRecentMemos] = useState<RecentMemoRes[]>([]);
  const [teams, setTeams] = useState<CreateTeamResponse[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [personalTodayTodos, setPersonalTodayTodos] = useState<TodoSummary[]>(
    [],
  );
  const [teamTodayTodos, setTeamTodayTodos] = useState<TodoSummary[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [todoStats, setTodoStats] = useState({
    total: 0,
    completed: 0,
    todo: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setTeams([]);
      setTeamId(null);
      return;
    }

    const convertedTeams: CreateTeamResponse[] = cachedTeams
      .slice(0, 3)
      .map((team) => ({
        id: team.teamId,
        name: team.name,
        description: "",
        ownerId: 0,
        createdAt: "",
      }));

    setTeams(convertedTeams);
    setTeamId(cachedTeams.length > 0 ? cachedTeams[0].teamId : null);
  }, [isAuthenticated, cachedTeams]);

  useEffect(() => {
    const fetchRecentMemos = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await memoService.getRecentMemos();

        if (response.success) {
          setRecentMemos(response.data);
        }
      } catch {}
    };

    fetchRecentMemos();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchTodayTodos = async () => {
      if (!isAuthenticated) return;

      try {
        const [personalTodos, teamTodos] = await Promise.all([
          todoService.getUpcomingTodo(),
          todoService.getUpcomingTeamTodo(),
        ]);

        setPersonalTodayTodos(personalTodos.slice(0, 5));
        setTeamTodayTodos(teamTodos.slice(0, 5));

        const allTodayTodos = [...personalTodos, ...teamTodos];
        const total = allTodayTodos.length;
        const completed = allTodayTodos.filter(
          (todo) => todo.todoStatus === TodoStatus.DONE,
        ).length;
        const todo = allTodayTodos.filter(
          (todo) => todo.todoStatus === TodoStatus.TODO,
        ).length;

        setTodoStats({ total, completed, todo });
      } catch {
        setPersonalTodayTodos([]);
        setTeamTodayTodos([]);
        setTodoStats({ total: 0, completed: 0, todo: 0 });
      }
    };

    fetchTodayTodos();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchUnreadMessagesCount = async () => {
      if (!isAuthenticated) {
        setUnreadMessagesCount(0);
        return;
      }

      try {
        const response = await notificationService.getNotifications(true);
        if (response.success) {
          setUnreadMessagesCount(response.data.length);
        }
      } catch {
        setUnreadMessagesCount(0);
      }
    };

    fetchUnreadMessagesCount();
  }, [isAuthenticated]);

  const quickStatsData = useMemo(() => {
    const personalTodosTotal = personalTodayTodos.length;
    const personalTodosCompleted = personalTodayTodos.filter(
      (todo) => todo.todoStatus === TodoStatus.DONE,
    ).length;

    return {
      teamsCount: teams.length,
      teamsNames:
        teams.length > 0 ? teams.map((t) => t.name).join(", ") : "속한 팀 없음",
      todosCount: todoStats.total,
      personalTodosCompleted,
      personalTodosTotal,
      teamTodosCount: teamTodayTodos.length,
      unreadMessagesCount,
    };
  }, [
    teams,
    todoStats.total,
    personalTodayTodos,
    teamTodayTodos.length,
    unreadMessagesCount,
  ]);

  const handleToggleTodayTodoStatus = useCallback(
    async (targetTodo: TodoSummary) => {
      const isTeamTodo = teamTodayTodos.some(
        (todo) => todo.id === targetTodo.id,
      );

      try {
        const nextStatus =
          targetTodo.todoStatus === TodoStatus.DONE
            ? TodoStatus.TODO
            : TodoStatus.DONE;
        const normalizedDate = targetTodo.dueDate.split("T")[0];

        await todoService.updateTodo(targetTodo.id, {
          title: targetTodo.title,
          date: normalizedDate,
          status: nextStatus,
        });

        const nextPersonalTodos = personalTodayTodos.map((todo) =>
          todo.id === targetTodo.id
            ? { ...todo, todoStatus: nextStatus }
            : todo,
        );
        const nextTeamTodos = teamTodayTodos.map((todo) =>
          todo.id === targetTodo.id
            ? { ...todo, todoStatus: nextStatus }
            : todo,
        );

        setPersonalTodayTodos(nextPersonalTodos);
        setTeamTodayTodos(nextTeamTodos);

        const allTodayTodos = [...nextPersonalTodos, ...nextTeamTodos];
        const total = allTodayTodos.length;
        const completed = allTodayTodos.filter(
          (todo) => todo.todoStatus === TodoStatus.DONE,
        ).length;
        const todo = allTodayTodos.filter(
          (todo) => todo.todoStatus === TodoStatus.TODO,
        ).length;

        setTodoStats({ total, completed, todo });
      } catch (error) {
        const status =
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof error.response === "object" &&
          error.response !== null &&
          "status" in error.response
            ? Number(error.response.status)
            : null;

        const backendMessage =
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof error.response === "object" &&
          error.response !== null &&
          "data" in error.response &&
          typeof error.response.data === "object" &&
          error.response.data !== null &&
          "message" in error.response.data &&
          typeof error.response.data.message === "string"
            ? error.response.data.message
            : null;

        if (status === 403 && isTeamTodo) {
          alert("팀 Todo는 팀장만 상태를 변경할 수 있습니다.");
          return;
        }

        alert(backendMessage ?? "Todo 상태 변경에 실패했습니다.");
      }
    },
    [personalTodayTodos, teamTodayTodos],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header currentPage="dashboard" />

        <section className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-800 to-black rounded-2xl mb-6">
              <span className="text-white font-bold text-3xl">D</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">DailyTask</h1>
            <p className="text-lg text-gray-600 mb-10">
              효율적인 팀 협업과 업무 관리를 위한 그룹웨어
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                <LogIn className="w-4 h-4" />
                로그인
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                회원가입
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="text-center text-sm text-gray-500">
              © 2026 DailyTask. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="dashboard" />

      <section className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              안녕하세요, {user?.nickname}님
            </h1>
            <p className="text-gray-600">오늘도 좋은 하루 보내세요!</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-gray-900">
              {new Date().toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
                weekday: "short",
              })}
            </div>
          </div>
        </div>

        <QuickStats
          teamsCount={quickStatsData.teamsCount}
          teamsNames={quickStatsData.teamsNames}
          todosCount={quickStatsData.todosCount}
          personalTodosCompleted={quickStatsData.personalTodosCompleted}
          personalTodosTotal={quickStatsData.personalTodosTotal}
          teamTodosCount={quickStatsData.teamTodosCount}
          unreadMessagesCount={quickStatsData.unreadMessagesCount}
        />
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          <TeamSummary teams={teams} />
          <RecentMemos memos={recentMemos} />
          <TodayTodos
            personalTodos={personalTodayTodos}
            teamTodos={teamTodayTodos}
            onToggleTodoStatus={handleToggleTodayTodoStatus}
          />
        </div>
      </section>
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-gray-800 to-black rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">D</span>
              </div>
              <span>© 2025 DailyTask for ㈜테크이노베이션</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-900">
                도움말
              </a>
              <a href="#" className="hover:text-gray-900">
                문의하기
              </a>
              <a href="#" className="hover:text-gray-900">
                개인정보처리방침
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
