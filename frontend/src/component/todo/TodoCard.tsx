import { memo } from "react";
import { Clock, Edit, Trash2, Flag } from "lucide-react";
import { TodoSummary, TodoStatus } from "@/src/features/todo/types/todo";

interface TodoCardProps {
  todo: TodoSummary;
  onStatusChange: (id: number, status: TodoStatus) => void;
  onEdit: (todo: TodoSummary) => void;
  onDelete: (id: number) => void;
  canManage: boolean;
  getStatusColor: (status: TodoStatus) => string;
  getStatusText: (status: TodoStatus) => string;
  getDueDateStatus: (dueDate: string) => {
    color: string;
    text: string;
    isOverdue: boolean;
  };
}

const TodoCard = memo(
  ({
    todo,
    onStatusChange,
    onEdit,
    onDelete,
    canManage,
    getStatusColor,
    getStatusText,
    getDueDateStatus,
  }: TodoCardProps) => {
    const dueDateStatus = getDueDateStatus(todo.dueDate);

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">{todo.title}</h3>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className={dueDateStatus.color}>
                {new Date(todo.dueDate).toLocaleDateString()} -{" "}
                {dueDateStatus.text}
              </span>
            </div>
          </div>
          {canManage && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(todo)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Edit className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => onDelete(todo.id)}
                className="p-2 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canManage ? (
            <div className="inline-flex items-center gap-1 rounded-lg bg-gray-100 p-1">
              {[TodoStatus.TODO, TodoStatus.IN_PROGRESS, TodoStatus.DONE].map(
                (status) => {
                  const isActive = todo.todoStatus === status;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => onStatusChange(todo.id, status)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      {getStatusText(status)}
                    </button>
                  );
                },
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 rounded-lg bg-gray-100 p-1">
              {[TodoStatus.TODO, TodoStatus.IN_PROGRESS, TodoStatus.DONE].map(
                (status) => {
                  const isActive = todo.todoStatus === status;

                  return (
                    <span
                      key={status}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                        isActive
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      {getStatusText(status)}
                    </span>
                  );
                },
              )}
            </div>
          )}
          {dueDateStatus.isOverdue && <Flag className="w-4 h-4 text-red-500" />}
        </div>
      </div>
    );
  },
);

TodoCard.displayName = "TodoCard";

export default TodoCard;
