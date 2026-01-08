import React, { memo } from "react";
import { Users } from "lucide-react";

interface TeamStatsProps {
  totalTeams: number;
  totalMembers: number;
  ownedTeams: number;
  participatingTeams: number;
}

const TeamStats = memo(function TeamStats({
  totalTeams,
  totalMembers,
  ownedTeams,
  participatingTeams,
}: TeamStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="text-sm text-gray-600 mb-1">소속 팀</div>
        <div className="text-2xl font-bold text-gray-900">{totalTeams}</div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="text-sm text-gray-600 mb-1">총 팀원</div>
        <div className="text-2xl font-bold text-gray-900">{totalMembers}</div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="text-sm text-gray-600 mb-1">관리 중인 팀</div>
        <div className="text-2xl font-bold text-gray-900">{ownedTeams}</div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="text-sm text-gray-600 mb-1">참여 중인 팀</div>
        <div className="text-2xl font-bold text-gray-900">
          {participatingTeams}
        </div>
      </div>
    </div>
  );
});

export default TeamStats;
