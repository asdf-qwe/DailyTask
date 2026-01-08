import React, { memo } from "react";
import { X, Copy } from "lucide-react";

interface InviteModalProps {
  show: boolean;
  inviteCode: string;
  onClose: () => void;
}

const InviteModal = memo(function InviteModal({
  show,
  inviteCode,
  onClose,
}: InviteModalProps) {
  if (!show) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    alert("초대 코드가 복사되었습니다.");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">팀원 초대 코드</h2>
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
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
              <input
                type="text"
                value={inviteCode}
                readOnly
                className="flex-1 outline-none bg-transparent text-gray-900 font-mono"
              />
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-gray-200 rounded"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>초대 방법:</strong> 이 코드를 팀원에게 공유하세요. 팀
              페이지에서 코드를 입력하면 팀에 참여할 수 있습니다. (24시간 유효)
            </p>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
});

export default InviteModal;
