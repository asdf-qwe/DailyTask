import React, { memo } from "react";
import { Send, Smile, Paperclip } from "lucide-react";

interface MessageInputProps {
  messageInput: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const MessageInput = memo(function MessageInput({
  messageInput,
  onMessageChange,
  onSend,
  onKeyPress,
}: MessageInputProps) {
  return (
    <div className="p-4 border-t border-gray-200 shrink-0 sticky bottom-0 bg-white z-10">
      <div className="flex items-end gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-lg mb-1">
          <Paperclip className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 border border-gray-200 rounded-lg focus-within:border-gray-900 transition-colors">
          <textarea
            value={messageInput}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
            className="w-full px-4 py-3 outline-none resize-none text-sm text-gray-900 placeholder-gray-400"
            rows={1}
          />
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg mb-1">
          <Smile className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={onSend}
          disabled={!messageInput.trim()}
          className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mb-1"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Enter로 전송 • Shift+Enter로 줄바꿈
      </p>
    </div>
  );
});

export default MessageInput;
