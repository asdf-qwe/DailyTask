import React, { memo } from "react";
import { User, Users, CheckSquare, MessageSquare } from "lucide-react";

interface QuickStatsProps {
  teamsCount: number;
  teamsNames: string;
  todosCount: number;
  personalTodosCompleted: number;
  personalTodosTotal: number;
  teamTodosCount: number;
  unreadMessagesCount: number;
}

const QuickStats = memo(function QuickStats({
  teamsCount,
  teamsNames,
  todosCount,
  personalTodosCompleted,
  personalTodosTotal,
  teamTodosCount,
  unreadMessagesCount,
}: QuickStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">속한 팀</span>
          <Users className="w-4 h-4 text-gray-700" />
        </div>
        <div className="text-2xl font-bold text-gray-900">{teamsCount}</div>
        <div className="text-xs text-gray-500 mt-1">{teamsNames}</div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">오늘의 Todo</span>
          <CheckSquare className="w-4 h-4 text-gray-600" />
        </div>
        <div className="text-2xl font-bold text-gray-900">{todosCount}</div>
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {personalTodosCompleted} / {personalTodosTotal}
          </span>
          <span className="text-gray-300">|</span>
          <span className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {teamTodosCount}
          </span>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">읽지 않은 메시지</span>
          <MessageSquare className="w-4 h-4 text-gray-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {unreadMessagesCount}
        </div>
        <div className="text-xs text-gray-500 mt-1">알림 기준</div>
      </div>
    </div>
  );
});

export default QuickStats;
