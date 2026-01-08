import React, { memo } from "react";
import {
  Hash,
  Users,
  Crown,
  MoreVertical,
  UserPlus,
  LogOut,
  Search,
} from "lucide-react";
import { Role } from "@/src/features/team/types/team";
import TeamMemberList from "./TeamMemberList";
import { TeamMemberListRes } from "@/src/features/team/types/team";

interface Team {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  role: Role;
}

interface TeamDetailsProps {
  team: Team | null;
  members: TeamMemberListRes[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onInvite: () => void;
  onLeave: () => void;
  onRemoveMember: (memberId: number) => void;
  getRoleBadge: (role: Role) => React.ReactElement;
}

const TeamDetails = memo(function TeamDetails({
  team,
  members,
  searchQuery,
  onSearchChange,
  onInvite,
  onLeave,
  onRemoveMember,
  getRoleBadge,
}: TeamDetailsProps) {
  if (!team) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 h-full flex items-center justify-center p-12">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium mb-2">
            팀을 선택해주세요
          </p>
          <p className="text-gray-400 text-sm">
            왼쪽 목록에서 팀을 선택하면 팀원 정보를 확인할 수 있습니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Team Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              {team.name}
              {team.role === Role.OWNER && (
                <Crown className="w-6 h-6 text-purple-600" />
              )}
            </h2>
            <p className="text-gray-600 mb-3">{team.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{team.memberCount}명</span>
              </div>
              <span>•</span>
              <span>생성일: {team.createdAt}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onInvite}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            팀원 초대
          </button>
          {team.role === Role.MEMBER && (
            <button
              onClick={onLeave}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />팀 탈퇴
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="팀원 검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Members List */}
      <TeamMemberList
        members={members}
        teamRole={team.role}
        onRemoveMember={onRemoveMember}
        getRoleBadge={getRoleBadge}
      />
    </div>
  );
});

export default TeamDetails;
