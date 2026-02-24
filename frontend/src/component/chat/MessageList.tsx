import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
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
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<number | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 88,
    overscan: 10,
  });

  const scrollToBottom = useCallback(() => {
    const el = scrollElementRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setIsNearBottom(true);
    setUnreadCount(0);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollElementRef.current;
    if (!el) return;

    const threshold = 80;
    const nearBottom =
      el.scrollHeight - (el.scrollTop + el.clientHeight) < threshold;
    setIsNearBottom(nearBottom);

    if (nearBottom) {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    const el = scrollElementRef.current;
    if (!el) return;

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (messages.length === 0) {
      lastMessageIdRef.current = null;
      setUnreadCount(0);
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const isNewMessage = lastMessageIdRef.current !== lastMessage.id;

    if (isNewMessage) {
      const isMyMessage = currentUserId === lastMessage.author.id;
      if (isNearBottom || isMyMessage) {
        requestAnimationFrame(scrollToBottom);
      } else {
        setUnreadCount((prev) => prev + 1);
      }
      lastMessageIdRef.current = lastMessage.id;
    }
  }, [messages, currentUserId, isNearBottom, scrollToBottom]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">메시지가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div ref={scrollElementRef} className="h-full overflow-y-auto px-4 py-4">
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const message = messages[virtualItem.index];
            const isMe = currentUserId === message.author.id;
            const authorInitial = message.author.name.charAt(0);
            const timestamp = new Date(message.createdAt).toLocaleTimeString(
              "ko-KR",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            );

            return (
              <div
                key={message.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="pb-3"
              >
                <div className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
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
                        <span className="text-xs text-gray-500">
                          {timestamp}
                        </span>
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
                      <span className="text-xs text-gray-500 mt-1">
                        {timestamp}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {unreadCount > 0 && !isNearBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute right-4 bottom-3 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-full shadow hover:bg-gray-800"
        >
          새 메시지 {unreadCount}개
        </button>
      )}
    </div>
  );
});

export default MessageList;
