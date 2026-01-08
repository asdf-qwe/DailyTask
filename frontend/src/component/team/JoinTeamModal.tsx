import React, { memo } from "react";
import { X } from "lucide-react";

interface JoinTeamModalProps {
  show: boolean;
  joinCode: string;
  onClose: () => void;
  onJoin: () => void;
  onCodeChange: (code: string) => void;
}

const JoinTeamModal = memo(function JoinTeamModal({
  show,
  joinCode,
  onClose,
  onJoin,
  onCodeChange,
}: JoinTeamModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">팀 가입</h2>
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
              초대 코드
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => onCodeChange(e.target.value)}
              placeholder="초대 코드를 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              autoFocus
            />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>안내:</strong> 팀 관리자로부터 받은 초대 코드를 입력하면
              해당 팀에 가입할 수 있습니다.
            </p>
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
            onClick={onJoin}
            disabled={!joinCode.trim()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            가입하기
          </button>
        </div>
      </div>
    </div>
  );
});

export default JoinTeamModal;
