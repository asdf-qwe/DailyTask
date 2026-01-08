import { memo } from "react";
import { X } from "lucide-react";
import { TodoStatus } from "@/src/features/todo/types/todo";

interface TodoEditModalProps {
  show: boolean;
  formData: {
    title: string;
    date: string;
    status: TodoStatus;
  };
  onClose: () => void;
  onUpdate: () => void;
  onFormChange: (data: { title: string; date: string; status: TodoStatus }) => void;
  getStatusText: (status: TodoStatus) => string;
}

const TodoEditModal = memo(
  ({
    show,
    formData,
    onClose,
    onUpdate,
    onFormChange,
    getStatusText,
  }: TodoEditModalProps) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full">
          <div className="border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Todo 수정</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                제목
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  onFormChange({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                마감일
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  onFormChange({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                상태
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    status: e.target.value as TodoStatus,
                  })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-900 cursor-pointer"
              >
                <option value={TodoStatus.TODO}>
                  {getStatusText(TodoStatus.TODO)}
                </option>
                <option value={TodoStatus.IN_PROGRESS}>
                  {getStatusText(TodoStatus.IN_PROGRESS)}
                </option>
                <option value={TodoStatus.DONE}>
                  {getStatusText(TodoStatus.DONE)}
                </option>
              </select>
            </div>
          </div>
          <div className="border-t border-gray-200 p-6 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={onUpdate}
              disabled={!formData.title.trim() || !formData.date}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              수정
            </button>
          </div>
        </div>
      </div>
    );
  }
);

TodoEditModal.displayName = "TodoEditModal";

export default TodoEditModal;
