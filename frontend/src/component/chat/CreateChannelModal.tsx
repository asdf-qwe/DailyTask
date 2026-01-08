import React, { memo } from "react";
import { X } from "lucide-react";

interface CreateChannelModalProps {
  show: boolean;
  channelName: string;
  onClose: () => void;
  onCreate: () => void;
  onNameChange: (name: string) => void;
}

const CreateChannelModal = memo(function CreateChannelModal({
  show,
  channelName,
  onClose,
  onCreate,
  onNameChange,
}: CreateChannelModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">새 채널 만들기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            채널 이름
          </label>
          <input
            type="text"
            value={channelName}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onCreate();
              }
            }}
            placeholder="채널 이름을 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            autoFocus
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onCreate();
            }}
            disabled={!channelName.trim()}
            className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            만들기
          </button>
        </div>
      </div>
    </div>
  );
});

export default CreateChannelModal;
