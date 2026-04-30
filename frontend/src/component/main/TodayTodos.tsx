"use client";

import React, { memo, useState } from "react";
import Link from "next/link";
import { User, Users, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { TodoSummary, TodoStatus } from "@/src/features/todo/types/todo";

interface TodayTodosProps {
  personalTodos: TodoSummary[];
  teamTodos: TodoSummary[];
  onToggleTodoStatus: (todo: TodoSummary) => void;
}

const TodayTodos = memo(function TodayTodos({
  personalTodos,
  teamTodos,
  onToggleTodoStatus,
}: TodayTodosProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "team">("personal");

  const currentTodos = activeTab === "personal" ? personalTodos : teamTodos;
  const allTodos = [...personalTodos, ...teamTodos];
  const completedCount = allTodos.filter(
    (t) => t.todoStatus === TodoStatus.DONE,
  ).length;
  const totalCount = allTodos.length;
  const progressPercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const getDueDateLabel = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays <= 0 ? "당일" : "마감임박";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* 히어로 헤더 */}
      <div className="bg-gray-900 px-6 pt-6 pb-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">오늘 할 일</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">
                {completedCount}
              </span>
              <span className="text-gray-400 text-lg mb-1">
                / {totalCount} 완료
              </span>
            </div>
          </div>
          <Link
            href="/main/todo"
            className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors mt-1"
          >
            전체보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 진행률 바 */}
        <div className="mb-1">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>
            {totalCount === 0
              ? "오늘 등록된 Todo가 없습니다"
              : progressPercent === 100
                ? "모두 완료했습니다!"
                : `${totalCount - completedCount}개 남았습니다`}
          </span>
          <span>{progressPercent}%</span>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 mt-4">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "personal"
                ? "bg-white text-gray-900"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            개인
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === "personal"
                  ? "bg-gray-100 text-gray-700"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {personalTodos.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("team")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "team"
                ? "bg-white text-gray-900"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />팀
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === "team"
                  ? "bg-gray-100 text-gray-700"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {teamTodos.length}
            </span>
          </button>
        </div>
      </div>

      {/* Todo 목록 */}
      <div className="p-4 space-y-1 max-h-72 overflow-y-auto">
        {currentTodos.length > 0 ? (
          currentTodos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <button
                type="button"
                onClick={() =>
                  activeTab === "personal" && onToggleTodoStatus(todo)
                }
                className={`mt-0.5 flex-shrink-0 transition-colors ${
                  activeTab === "personal"
                    ? "cursor-pointer"
                    : "cursor-default opacity-50"
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
                <div className="flex items-center gap-2 mt-0.5">
                  {activeTab === "team" && todo.name && (
                    <>
                      <span className="text-xs text-gray-500">{todo.name}</span>
                      <span className="text-gray-300 text-xs">·</span>
                    </>
                  )}
                  <span className="text-xs text-gray-400">
                    {getDueDateLabel(todo.dueDate)} ·{" "}
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
                    {todo.todoStatus === TodoStatus.DONE
                      ? "완료"
                      : todo.todoStatus === TodoStatus.IN_PROGRESS
                        ? "진행중"
                        : "할 일"}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm">
            {activeTab === "personal"
              ? "오늘 개인 할 일이 없습니다"
              : "오늘 팀 할 일이 없습니다"}
          </div>
        )}
      </div>
    </div>
  );
});

export default TodayTodos;
