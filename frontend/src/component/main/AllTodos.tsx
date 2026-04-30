"use client";

import React, { memo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  User,
  Users,
  Search,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { todoService } from "@/src/features/todo/service/todoService";
import { TodoSummary, TodoStatus } from "@/src/features/todo/types/todo";
import { useTeam } from "@/src/features/team/context/TeamContext";

interface AllTodosProps {
  onToggleTodoStatus: (todo: TodoSummary) => void;
}

const STATUS_LABEL: Record<TodoStatus, string> = {
  [TodoStatus.TODO]: "할 일",
  [TodoStatus.IN_PROGRESS]: "진행중",
  [TodoStatus.DONE]: "완료",
};

const AllTodos = memo(function AllTodos({ onToggleTodoStatus }: AllTodosProps) {
  const { teams: cachedTeams } = useTeam();
  const [activeTab, setActiveTab] = useState<"personal" | "team">("personal");
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [todos, setTodos] = useState<TodoSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 팀 목록 초기화
  useEffect(() => {
    if (cachedTeams.length > 0 && selectedTeamId === null) {
      setSelectedTeamId(cachedTeams[0].teamId);
    }
  }, [cachedTeams, selectedTeamId]);

  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === "personal") {
        const res = await todoService.getTodoList(0, 50);
        setTodos(res.content);
      } else {
        if (selectedTeamId === null) {
          setTodos([]);
          return;
        }
        const res = await todoService.getTeamTodoList(selectedTeamId, 0, 50);
        setTodos(res.content);
      }
    } catch {
      setTodos([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedTeamId]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const filtered = todos.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleToggle = async (todo: TodoSummary) => {
    if (activeTab === "team") return;
    onToggleTodoStatus(todo);
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id
          ? {
              ...t,
              todoStatus:
                t.todoStatus === TodoStatus.DONE
                  ? TodoStatus.TODO
                  : TodoStatus.DONE,
            }
          : t,
      ),
    );
  };

  const selectedTeamName =
    cachedTeams.find((t) => t.teamId === selectedTeamId)?.name ?? "팀 선택";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">전체 Todo</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchTodos}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="새로고침"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
            <Link
              href="/main/todo"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              전체보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "personal"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            개인
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("team")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "team"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Users className="w-3.5 h-3.5" />팀
          </button>
        </div>

        {/* 팀 선택 드롭다운 (팀 탭일 때만) */}
        {activeTab === "team" && (
          <div className="mb-3">
            {cachedTeams.length === 0 ? (
              <p className="text-sm text-gray-400">속한 팀이 없습니다</p>
            ) : (
              <div className="relative">
                <select
                  value={selectedTeamId ?? ""}
                  onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                  className="w-full appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900 cursor-pointer"
                >
                  {cachedTeams.map((team) => (
                    <option key={team.teamId} value={team.teamId}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>
        )}

        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Todo 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            {searchQuery ? "검색 결과가 없습니다" : "등록된 Todo가 없습니다"}
          </div>
        ) : (
          filtered.map((todo) => (
            <div
              key={todo.id}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <button
                type="button"
                onClick={() => handleToggle(todo)}
                className={`mt-0.5 flex-shrink-0 transition-colors ${
                  activeTab === "personal"
                    ? "cursor-pointer"
                    : "cursor-default opacity-40"
                }`}
                disabled={activeTab === "team"}
              >
                {todo.todoStatus === TodoStatus.DONE ? (
                  <CheckCircle2 className="w-5 h-5 text-gray-900" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium truncate ${
                    todo.todoStatus === TodoStatus.DONE
                      ? "line-through text-gray-400"
                      : "text-gray-900"
                  }`}
                >
                  {todo.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {todo.name && activeTab === "personal" && (
                    <>
                      <span className="text-xs text-gray-500">{todo.name}</span>
                      <span className="text-gray-300 text-xs">·</span>
                    </>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(todo.dueDate).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      todo.todoStatus === TodoStatus.DONE
                        ? "bg-gray-100 text-gray-500"
                        : todo.todoStatus === TodoStatus.IN_PROGRESS
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {STATUS_LABEL[todo.todoStatus]}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 하단 카운트 */}
      {!isLoading && todos.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          {activeTab === "team" && (
            <span className="font-medium text-gray-600 mr-1">
              {selectedTeamName}
            </span>
          )}
          총 {todos.length}개 · 완료{" "}
          {todos.filter((t) => t.todoStatus === TodoStatus.DONE).length}개
        </div>
      )}
    </div>
  );
});

export default AllTodos;
