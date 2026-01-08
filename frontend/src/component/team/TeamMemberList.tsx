import React, { memo } from "react";
import { Users, Crown, Trash2 } from "lucide-react";
import { TeamMemberListRes, Role } from "@/src/features/team/types/team";

interface TeamMemberListProps {
  members: TeamMemberListRes[];
  teamRole: Role;
  onRemoveMember: (memberId: number) => void;
  getRoleBadge: (role: Role) => React.ReactElement;
}

const TeamMemberList = memo(function TeamMemberList({
  members,
  teamRole,
  onRemoveMember,
  getRoleBadge,
}: TeamMemberListProps) {
  if (members.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">검색 결과가 없습니다</div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
      {members.map((member) => (
        <div
          key={member.memberId}
          className="p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium">
                {member.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">
                  {member.name}
                </span>
                {getRoleBadge(member.role)}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>{member.email}</span>
              </div>
            </div>
            {teamRole === Role.OWNER && member.role !== Role.OWNER && (
              <button
                onClick={() => onRemoveMember(member.memberId)}
                className="p-2 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

export default TeamMemberList;
