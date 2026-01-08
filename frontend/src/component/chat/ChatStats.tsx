import React, { memo } from "react";

interface ChatStatsProps {
  totalChannels: number;
  participatingChannels: number;
}

const ChatStats = memo(function ChatStats({
  totalChannels,
  participatingChannels,
}: ChatStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="text-sm text-gray-600 mb-1">전체 채널</div>
        <div className="text-2xl font-bold text-gray-900">{totalChannels}</div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="text-sm text-gray-600 mb-1">참여 중인 채널</div>
        <div className="text-2xl font-bold text-gray-900">
          {participatingChannels}
        </div>
      </div>
    </div>
  );
});

export default ChatStats;
