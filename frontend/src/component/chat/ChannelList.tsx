import React, { memo } from "react";
import { Search, Hash, Users } from "lucide-react";
import { ChannelListRes } from "@/src/features/channel/types/channel";

interface ChannelListProps {
  channels: ChannelListRes[];
  selectedChannel: ChannelListRes | null;
  searchQuery: string;
  isLoading: boolean;
  onChannelSelect: (channel: ChannelListRes) => void;
  onSearchChange: (query: string) => void;
}

const ChannelList = memo(function ChannelList({
  channels,
  selectedChannel,
  searchQuery,
  isLoading,
  onChannelSelect,
  onSearchChange,
}: ChannelListProps) {
  return (
    <div className="w-80 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="채널 검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            로딩 중...
          </div>
        ) : channels.length > 0 ? (
          channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel)}
              className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                selectedChannel?.id === channel.id ? "bg-gray-50" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2 flex-1">
                  <Hash className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="font-semibold text-gray-900 text-sm truncate">
                    {channel.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {new Date(channel.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1 ml-6">
                <Users className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {channel.teamName}
                </span>
              </div>
            </button>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 text-sm">
            {searchQuery ? "검색 결과가 없습니다" : "채널이 없습니다"}
          </div>
        )}
      </div>
    </div>
  );
});

export default ChannelList;
