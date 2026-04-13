import { memo } from "react";
import { X, Users, Lock } from "lucide-react";
import { Visibility } from "@/src/features/memo/types/memo";

interface MemoCreateModalProps {
  show: boolean;
  formData: {
    title: string;
    content: string;
    visibility: Visibility;
  };
  teams: { teamId: number; name: string }[];
  teamId: number | null;
  isEditMode?: boolean;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (data: any) => void;
  onTeamChange: (teamId: number) => void;
}

const MemoCreateModal = memo(
  ({
    show,
    formData,
    teams,
    teamId,
    isEditMode = false,
    onClose,
    onSave,
    onFormChange,
    onTeamChange,
  }: MemoCreateModalProps) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? "메모 수정" : "새 메모 작성"}
            </h2>
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
                placeholder="메모 제목을 입력하세요"
                value={formData.title}
                onChange={(e) =>
                  onFormChange({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                내용
              </label>
              <textarea
                placeholder="메모 내용을 입력하세요"
                rows={8}
                value={formData.content}
                onChange={(e) =>
                  onFormChange({ ...formData, content: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-900 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                팀 선택
              </label>
              <select
                value={teamId || ""}
                onChange={(e) => onTeamChange(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-900 cursor-pointer"
              >
                {teams.map((team) => (
                  <option key={team.teamId} value={team.teamId}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                공개 여부
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="public"
                    checked={formData.visibility === Visibility.TEAM}
                    onChange={() =>
                      onFormChange({ ...formData, visibility: Visibility.TEAM })
                    }
                    className="w-4 h-4"
                  />
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-900">공개</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="public"
                    checked={formData.visibility === Visibility.PRIVATE}
                    onChange={() =>
                      onFormChange({
                        ...formData,
                        visibility: Visibility.PRIVATE,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-900">비공개</span>
                </label>
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={onSave}
              disabled={!formData.title.trim() || !formData.content.trim()}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    );
  },
);

MemoCreateModal.displayName = "MemoCreateModal";

export default MemoCreateModal;
