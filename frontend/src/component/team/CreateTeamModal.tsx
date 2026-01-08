import React, { memo } from "react";
import { X } from "lucide-react";

interface CreateTeamModalProps {
  show: boolean;
  teamName: string;
  teamDescription: string;
  onClose: () => void;
  onCreate: () => void;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
}

const CreateTeamModal = memo(function CreateTeamModal({
  show,
  teamName,
  teamDescription,
  onClose,
  onCreate,
  onNameChange,
  onDescriptionChange,
}: CreateTeamModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">새 팀 만들기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              팀 이름 *
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="팀 이름을 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              팀 설명
            </label>
            <textarea
              value={teamDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="팀에 대한 설명을 입력하세요 (선택사항)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              rows={3}
            />
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={onCreate}
            disabled={!teamName.trim()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            팀 생성
          </button>
        </div>
      </div>
    </div>
  );
});

export default CreateTeamModal;
