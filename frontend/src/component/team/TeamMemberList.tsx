import React, { memo, useState } from "react";
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
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);
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
              <>
                {confirmRemoveId === member.memberId && (
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setConfirmRemoveId(null)}
                  />
                )}
                {confirmRemoveId === member.memberId ? (
                  <div className="flex items-center gap-1 relative z-20">
                    <button
                      onClick={() => setConfirmRemoveId(null)}
                      className="text-xs px-2 py-1 rounded hover:bg-gray-100 text-gray-500"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => {
                        onRemoveMember(member.memberId);
                        setConfirmRemoveId(null);
                      }}
                      className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                    >
                      제거
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmRemoveId(member.memberId)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

export default TeamMemberList;
