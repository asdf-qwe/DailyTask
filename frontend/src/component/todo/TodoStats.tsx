import { memo } from "react";
import { TodoSummary, TodoStatus } from "@/src/features/todo/types/todo";

interface TodoStatsProps {
  todos: TodoSummary[];
  totalElements: number;
}

const TodoStats = memo(({ todos, totalElements }: TodoStatsProps) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="text-sm text-gray-600 mb-1">전체</div>
        <div className="text-2xl font-bold text-gray-900">{totalElements}</div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="text-sm text-gray-600 mb-1">할 일</div>
        <div className="text-2xl font-bold text-gray-900">
          {todos.filter((t) => t.todoStatus === TodoStatus.TODO).length}
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="text-sm text-gray-600 mb-1">진행중</div>
        <div className="text-2xl font-bold text-blue-600">
          {todos.filter((t) => t.todoStatus === TodoStatus.IN_PROGRESS).length}
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="text-sm text-gray-600 mb-1">완료</div>
        <div className="text-2xl font-bold text-green-600">
          {todos.filter((t) => t.todoStatus === TodoStatus.DONE).length}
        </div>
      </div>
    </div>
  );
});

TodoStats.displayName = "TodoStats";

export default TodoStats;
