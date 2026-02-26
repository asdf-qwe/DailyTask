"use client";

import React, { memo, useState } from "react";
import Link from "next/link";
import { User, Users } from "lucide-react";
import { TodoSummary, TodoStatus } from "@/src/features/todo/types/todo";

interface TodayTodosProps {
  personalTodos: TodoSummary[];
  teamTodos: TodoSummary[];
  onToggleTodoStatus: (todo: TodoSummary) => void;
}

const TodoSection = ({
  title,
  todos,
  emptyText,
  onToggleTodoStatus,
  showCheckbox,
}: {
  title: string;
  todos: TodoSummary[];
  emptyText: string;
  onToggleTodoStatus: (todo: TodoSummary) => void;
  showCheckbox: boolean;
}) => {
  const getDueDateLabel = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays <= 0) {
      return "당일";
    }

    return "마감임박";
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="space-y-2">
        {todos.length > 0 ? (
          todos.map((todo) => (
            <div
              key={`${title}-${todo.id}`}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="w-3.5 h-3.5 mt-0.5 flex-shrink-0">
                {showCheckbox && (
                  <input
                    type="checkbox"
                    checked={todo.todoStatus === TodoStatus.DONE}
                    onChange={() => onToggleTodoStatus(todo)}
                    className="w-3.5 h-3.5"
                  />
                )}
              </div>
              <div className="flex-1">
                <div
                  className={`font-medium text-gray-900 text-[15px] ${
                    todo.todoStatus === TodoStatus.DONE
                      ? "line-through text-gray-500"
                      : ""
                  }`}
                >
                  {todo.title}
                </div>
                {title === "팀" ? (
                  <div className="text-xs text-gray-500 mt-1">
                    <span className="text-gray-600">
                      {todo.name ? todo.name : "팀 정보 없음"}
                    </span>
                    <span className="text-gray-400"> · </span>
                    {getDueDateLabel(todo.dueDate)} ·{" "}
                    {new Date(todo.dueDate).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 mt-1">
                    {getDueDateLabel(todo.dueDate)} ·{" "}
                    {new Date(todo.dueDate).toLocaleDateString()}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className={`inline-flex items-center rounded-lg p-1 ${
                      todo.todoStatus === TodoStatus.DONE
                        ? "bg-gray-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-medium shadow-sm inline-flex items-center gap-1 ${
                        todo.todoStatus === TodoStatus.DONE
                          ? "bg-gray-200 text-gray-700"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      {todo.todoStatus === TodoStatus.TODO
                        ? "할 일"
                        : todo.todoStatus === TodoStatus.IN_PROGRESS
                          ? "진행중"
                          : "완료"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
};

const TodayTodos = memo(function TodayTodos({
  personalTodos,
  teamTodos,
  onToggleTodoStatus,
}: TodayTodosProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "team">("personal");

  const currentTodos = activeTab === "personal" ? personalTodos : teamTodos;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">오늘 Todo</h2>
          <div className="w-px h-4 bg-gray-300" />
          <div className="inline-flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={`text-sm transition-colors ${
                activeTab === "personal"
                  ? "text-gray-900 font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>개인</span>
                <span>{personalTodos.length}</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("team")}
              className={`text-sm transition-colors ${
                activeTab === "team"
                  ? "text-gray-900 font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>팀</span>
                <span>{teamTodos.length}</span>
              </span>
            </button>
          </div>
        </div>
        <Link
          href="/main/todo"
          className="text-sm text-gray-700 hover:text-gray-900"
        >
          전체보기
        </Link>
      </div>

      <div>
        <TodoSection
          title={activeTab === "personal" ? "개인" : "팀"}
          todos={currentTodos}
          onToggleTodoStatus={onToggleTodoStatus}
          showCheckbox={activeTab === "personal"}
          emptyText={
            activeTab === "personal"
              ? "오늘 개인 할 일이 없습니다"
              : "오늘 팀 할 일이 없습니다"
          }
        />
      </div>
    </div>
  );
});

export default TodayTodos;
