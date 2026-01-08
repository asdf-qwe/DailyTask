import React, { memo } from "react";
import { Users, Crown } from "lucide-react";
import { Role } from "@/src/features/team/types/team";

interface Team {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  role: Role;
}

interface TeamListProps {
  teams: Team[];
  selectedTeam: Team | null;
  onSelectTeam: (team: Team) => void;
}

const TeamList = memo(function TeamList({
  teams,
  selectedTeam,
  onSelectTeam,
}: TeamListProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-bold text-gray-900">내 팀 목록</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => onSelectTeam(team)}
            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
              selectedTeam?.id === team.id ? "bg-gray-50" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  {team.name}
                  {team.role === Role.OWNER && (
                    <Crown className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {team.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              <span>{team.memberCount}명</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

export default TeamList;
