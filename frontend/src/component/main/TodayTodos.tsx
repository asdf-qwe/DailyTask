import React, { memo } from "react";
import Link from "next/link";
import { TodoSummary, TodoStatus } from "@/src/features/todo/types/todo";

interface TodayTodosProps {
  todos: TodoSummary[];
}

const TodayTodos = memo(function TodayTodos({ todos }: TodayTodosProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">오늘의 Todo</h2>
        <Link
          href="/main/todo"
          className="text-sm text-gray-700 hover:text-gray-900"
        >
          전체보기
        </Link>
      </div>
      <div className="space-y-3">
        {todos.length > 0 ? (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg"
            >
              <input
                type="checkbox"
                checked={todo.todoStatus === TodoStatus.DONE}
                readOnly
                className="mt-1"
              />
              <div className="flex-1">
                <div
                  className={`font-medium text-gray-900 text-sm ${
                    todo.todoStatus === TodoStatus.DONE
                      ? "line-through text-gray-500"
                      : ""
                  }`}
                >
                  {todo.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  마감: {new Date(todo.dueDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={
                      todo.todoStatus === TodoStatus.TODO
                        ? "px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded"
                        : todo.todoStatus === TodoStatus.IN_PROGRESS
                        ? "px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                        : "px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded"
                    }
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
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">
            오늘 할 일이 없습니다
          </div>
        )}
      </div>
    </div>
  );
});

export default TodayTodos;
