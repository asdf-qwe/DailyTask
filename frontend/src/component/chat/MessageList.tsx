import React, { memo } from "react";
import { MessageRes } from "@/src/features/message/types/message";

interface MessageListProps {
  messages: MessageRes[];
  currentUserId: number | undefined;
  isLoading: boolean;
}

const MessageList = memo(function MessageList({
  messages,
  currentUserId,
  isLoading,
}: MessageListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">메시지가 없습니다</p>
      </div>
    );
  }

  return (
    <>
      {messages.map((message) => {
        const isMe = currentUserId === message.author.id;
        const authorInitial = message.author.name.charAt(0);
        const timestamp = new Date(message.createdAt).toLocaleTimeString(
          "ko-KR",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );

        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
          >
            {!isMe && (
              <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">
                  {authorInitial}
                </span>
              </div>
            )}
            <div
              className={`flex-1 max-w-[70%] ${
                isMe ? "items-end" : "items-start"
              } flex flex-col`}
            >
              {!isMe && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {message.author.name}
                  </span>
                  <span className="text-xs text-gray-500">{timestamp}</span>
                </div>
              )}
              <div
                className={`px-4 py-2 rounded-lg ${
                  isMe
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
              {isMe && (
                <span className="text-xs text-gray-500 mt-1">{timestamp}</span>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
});

export default MessageList;
