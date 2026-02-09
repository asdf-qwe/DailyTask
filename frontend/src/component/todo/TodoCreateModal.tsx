import { memo } from "react";
import { X, Users } from "lucide-react";

interface TodoCreateModalProps {
  show: boolean;
  formData: {
    title: string;
    dueDate: string;
  };
  isTeamMode?: boolean;
  teamName?: string;
  onClose: () => void;
  onCreate: () => void;
  onFormChange: (data: { title: string; dueDate: string }) => void;
}

const TodoCreateModal = memo(
  ({
    show,
    formData,
    isTeamMode = false,
    teamName = "",
    onClose,
    onCreate,
    onFormChange,
  }: TodoCreateModalProps) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full">
          <div className="border-b border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">새 Todo 추가</h2>
              {isTeamMode && teamName && (
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {teamName} 팀 Todo
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
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
                placeholder="할 일을 입력하세요"
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
                value={formData.dueDate}
                onChange={(e) =>
                  onFormChange({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-900"
              />
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
              onClick={onCreate}
              disabled={!formData.title.trim() || !formData.dueDate}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              추가
            </button>
          </div>
        </div>
      </div>
    );
  },
);

TodoCreateModal.displayName = "TodoCreateModal";

export default TodoCreateModal;
