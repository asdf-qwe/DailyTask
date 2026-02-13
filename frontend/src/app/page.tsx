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
import { memoService } from "@/src/features/memo/service/memoSercice";
import { MemoSummary } from "@/src/features/memo/types/memo";
import { teamService } from "@/src/features/team/service/teamService";
import { CreateTeamResponse } from "@/src/features/team/types/team";
import { todoService } from "@/src/features/todo/service/todoService";
import { TodoSummary, TodoStatus } from "@/src/features/todo/types/todo";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [recentMemos, setRecentMemos] = useState<MemoSummary[]>([]);
  const [teams, setTeams] = useState<CreateTeamResponse[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [todayTodos, setTodayTodos] = useState<TodoSummary[]>([]);
  const [todoStats, setTodoStats] = useState({
    total: 0,
    completed: 0,
    todo: 0,
  });

  // 팀 목록 불러오기
  useEffect(() => {
    const fetchTeams = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await teamService.getTeam();
        if (response.success) {
          // GetTeamRes를 CreateTeamResponse 형식으로 변환
          const convertedTeams: CreateTeamResponse[] = response.data
            .slice(0, 3)
            .map((team) => ({
              id: team.teamId,
              name: team.name,
              description: "",
              ownerId: 0,
              createdAt: "",
            }));
          setTeams(convertedTeams);

          if (response.data.length > 0) {
            setTeamId(response.data[0].teamId); // 첫 번째 팀 사용
          }
        }
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      }
    };

    fetchTeams();
  }, [isAuthenticated]);

  // 최근 메모 불러오기
  useEffect(() => {
    const fetchRecentMemos = async () => {
      if (!isAuthenticated || teamId === null) return;

      try {
        const response = await memoService.getMemoList(teamId, 0, 5);

        if (response.success) {
          setRecentMemos(response.data.items.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch recent memos:", error);
      }
    };

    fetchRecentMemos();
  }, [isAuthenticated, teamId]);

  // 오늘의 Todo 불러오기
  useEffect(() => {
    const fetchTodayTodos = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await todoService.getTodoList(0, 20);

        // 오늘 날짜의 Todo만 필터링
        const today = new Date().toISOString().split("T")[0];
        const todayTodoList = response.content.filter(
          (todo) => todo.dueDate.split("T")[0] === today
        );

        setTodayTodos(todayTodoList.slice(0, 5));

        // 통계 계산
        const total = todayTodoList.length;
        const completed = todayTodoList.filter(
          (todo) => todo.todoStatus === TodoStatus.DONE
        ).length;
        const todo = todayTodoList.filter(
          (todo) => todo.todoStatus === TodoStatus.TODO
        ).length;

        setTodoStats({ total, completed, todo });
      } catch (error) {
        console.error("Failed to fetch today's todos:", error);
        // 에러 발생 시 빈 배열로 설정
        setTodayTodos([]);
        setTodoStats({ total: 0, completed: 0, todo: 0 });
      }
    };

    fetchTodayTodos();
  }, [isAuthenticated]);

  // 통계 계산 (useMemo로 최적화)
  const quickStatsData = useMemo(() => {
    return {
      teamsCount: teams.length,
      teamsNames:
        teams.length > 0 ? teams.map((t) => t.name).join(", ") : "속한 팀 없음",
      todosCount: todoStats.todo,
      todosCompleted: todoStats.completed,
      todosTotal: todoStats.total,
    };
  }, [teams, todoStats]);

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

        {/* Landing Section */}
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

        {/* Footer */}
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

      {/* Welcome Section */}
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

        {/* Quick Stats */}
        <QuickStats
          teamsCount={quickStatsData.teamsCount}
          teamsNames={quickStatsData.teamsNames}
          todosCount={quickStatsData.todosCount}
          todosCompleted={quickStatsData.todosCompleted}
          todosTotal={quickStatsData.todosTotal}
        />
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          {/* 속한 팀 */}
          <TeamSummary teams={teams} />

          {/* 최근 작성된 메모 */}
          <RecentMemos memos={recentMemos} />

          {/* 오늘의 Todo */}
          <TodayTodos todos={todayTodos} />
        </div>
      </section>

      {/* Footer */}
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
