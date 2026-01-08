import React, { memo } from "react";
import { X } from "lucide-react";

interface LeaveTeamModalProps {
  show: boolean;
  teamName: string;
  onClose: () => void;
  onLeave: () => void;
}

const LeaveTeamModal = memo(function LeaveTeamModal({
  show,
  teamName,
  onClose,
  onLeave,
}: LeaveTeamModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">팀 탈퇴</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            정말로 <strong>{teamName}</strong> 팀에서 탈퇴하시겠습니까?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>주의:</strong> 탈퇴 시 팀의 모든 메모, 채팅, Todo 등에
              접근할 수 없게 됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={onLeave}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
});

export default LeaveTeamModal;
