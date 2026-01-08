import { memo } from "react";
import { Clock, Edit, Trash2, Flag } from "lucide-react";
import { TodoSummary, TodoStatus } from "@/src/features/todo/types/todo";

interface TodoCardProps {
  todo: TodoSummary;
  onStatusChange: (id: number, status: TodoStatus) => void;
  onEdit: (todo: TodoSummary) => void;
  onDelete: (id: number) => void;
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(todo)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="p-2 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={todo.todoStatus}
            onChange={(e) =>
              onStatusChange(todo.id, e.target.value as TodoStatus)
            }
            className={`px-3 py-1 rounded-lg text-sm font-medium cursor-pointer ${getStatusColor(
              todo.todoStatus
            )}`}
          >
            <option value={TodoStatus.TODO}>{getStatusText(TodoStatus.TODO)}</option>
            <option value={TodoStatus.IN_PROGRESS}>
              {getStatusText(TodoStatus.IN_PROGRESS)}
            </option>
            <option value={TodoStatus.DONE}>{getStatusText(TodoStatus.DONE)}</option>
          </select>
          {dueDateStatus.isOverdue && (
            <Flag className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>
    );
  }
);

TodoCard.displayName = "TodoCard";

export default TodoCard;
