import React, { memo } from "react";
import Link from "next/link";
import {
  User,
  Users,
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
} from "lucide-react";

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
  const pendingCount =
    personalTodosTotal -
    personalTodosCompleted +
    (teamTodosCount > 0 ? teamTodosCount : 0);
  const personalProgress =
    personalTodosTotal === 0
      ? 0
      : Math.round((personalTodosCompleted / personalTodosTotal) * 100);

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {/* 개인 Todo 진행률 */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">개인 Todo</span>
          <User className="w-4 h-4 text-gray-500" />
        </div>
        <div className="flex items-end gap-1 mb-2">
          <span className="text-2xl font-bold text-gray-900">
            {personalTodosCompleted}
          </span>
          <span className="text-gray-400 text-sm mb-0.5">
            / {personalTodosTotal}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-gray-800 rounded-full h-1.5 transition-all duration-500"
            style={{ width: `${personalProgress}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {personalProgress}% 완료
        </div>
      </div>

      {/* 팀 Todo */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">팀 Todo</span>
          <Users className="w-4 h-4 text-gray-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {teamTodosCount}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          오늘 마감
        </div>
      </div>

      {/* 미완료 */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">미완료</span>
          <Circle className="w-4 h-4 text-gray-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {pendingCount}
        </div>
        <div className="text-xs text-gray-400">전체 {todosCount}개 중</div>
      </div>

      {/* 읽지 않은 메시지 */}
      <Link
        href="/main/chat"
        className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all block"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">읽지 않은 메시지</span>
          <MessageSquare className="w-4 h-4 text-gray-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {unreadMessagesCount}
        </div>
        <div className="text-xs text-gray-400">채팅으로 이동 →</div>
      </Link>
    </div>
  );
});

export default QuickStats;
