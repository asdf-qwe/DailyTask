import React, { memo } from "react";
import Link from "next/link";
import { CreateTeamResponse } from "@/src/features/team/types/team";

interface TeamSummaryProps {
  teams: CreateTeamResponse[];
}

const TeamSummary = memo(function TeamSummary({ teams }: TeamSummaryProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">속한 팀</h2>
        <Link
          href="/main/team"
          className="text-sm text-gray-700 hover:text-gray-900"
        >
          전체보기
        </Link>
      </div>
      <div className="space-y-3">
        {teams.length > 0 ? (
          teams.map((team) => (
            <Link
              key={team.id}
              href="/main/team"
              className="block p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">
                    {team.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm mb-1">
                    {team.name}
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-1">
                    {team.description}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">
            속한 팀이 없습니다
          </div>
        )}
      </div>
    </div>
  );
});

export default TeamSummary;
