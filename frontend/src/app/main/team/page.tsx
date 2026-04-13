"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Plus,
  Search,
  Settings,
  UserPlus,
  LogOut,
  Mail,
  Shield,
  MoreVertical,
  Edit,
  Trash2,
  X,
  Crown,
  Check,
  Copy,
} from "lucide-react";
import Header from "@/src/component/Header";
import TeamList from "@/src/component/team/TeamList";
import TeamDetails from "@/src/component/team/TeamDetails";
import InviteModal from "@/src/component/team/InviteModal";
import CreateTeamModal from "@/src/component/team/CreateTeamModal";
import JoinTeamModal from "@/src/component/team/JoinTeamModal";
import LeaveTeamModal from "@/src/component/team/LeaveTeamModal";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { useTeam } from "@/src/features/team/context/TeamContext";
import { teamService } from "@/src/features/team/service/teamService";
import {
  TeamMemberListRes,
  Role,
  CreateTeamRequest,
  CreateInviteCodeRequest,
} from "@/src/features/team/types/team";

interface Team {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  role: Role;
}

export default function TeamPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { teams: cachedTeams, refreshTeams } = useTeam();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberListRes[]>([]);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });
  const [editTeam, setEditTeam] = useState({ name: "", description: "" });

  const mappedTeams = useMemo<Team[]>(
    () =>
      cachedTeams.map((team) => {
        return {
          id: team.teamId,
          name: team.name,
          description: "",
          memberCount: team.memberCount ?? 0,
          createdAt: "",
          role: team.role,
        };
      }),
    [cachedTeams],
  );

  useEffect(() => {
    if (!user) {
      setTeams([]);
      setSelectedTeam(null);
      return;
    }

    setTeams(mappedTeams);
    setSelectedTeam((prev) => {
      if (mappedTeams.length === 0) return null;
      if (!prev) return mappedTeams[0];

      const matched = mappedTeams.find((team) => team.id === prev.id);
      if (!matched) return mappedTeams[0];

      return matched;
    });
  }, [user, mappedTeams]);

  useEffect(() => {
    const teamId = selectedTeam?.id;

    const fetchTeamMembers = async () => {
      if (!teamId) return;

      setIsLoading(true);
      try {
        const response = await teamService.getTeamMembers(teamId);
        if (response.data) {
          setTeamMembers(response.data);

          if (user) {
            const myMember = response.data.find((m) => m.userId === user.id);
            if (myMember) {
              setSelectedTeam((prev) =>
                prev && prev.role !== myMember.role
                  ? { ...prev, role: myMember.role }
                  : prev,
              );
            }
          }
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, [selectedTeam?.id, user?.id]);

  const filteredMembers = useMemo(() => {
    return teamMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [teamMembers, searchQuery]);

  const stats = useMemo(() => {
    return {
      totalTeams: teams.length,
      totalMembers: teams.reduce(
        (sum, team) => sum + (team.memberCount ?? 0),
        0,
      ),
      ownedTeams: teams.filter((t) => t.role === Role.OWNER).length,
      participatingTeams: teams.filter((t) => t.role === Role.MEMBER).length,
    };
  }, [teams]);

  const handleCreateTeam = useCallback(async () => {
    if (!newTeam.name.trim()) return;

    try {
      const response = await teamService.createTeam(newTeam);
      if (response.data) {
        alert("팀이 생성되었습니다.");
        setNewTeam({ name: "", description: "" });
        setShowCreateModal(false);
        setSelectedTeam((prev) =>
          prev && prev.id === response.data.id
            ? prev
            : {
                id: response.data.id,
                name: response.data.name,
                description: response.data.description ?? "",
                memberCount: 1,
                createdAt: response.data.createdAt,
                role: Role.OWNER,
              },
        );
        await refreshTeams();
      }
    } catch {
      alert("팀 생성에 실패했습니다.");
    }
  }, [newTeam, refreshTeams]);

  const handleGenerateInviteCode = useCallback(async () => {
    if (!selectedTeam) return;

    try {
      const response = await teamService.createInviteCode(selectedTeam.id, {
        expiresInHours: 24,
      });
      if (response.data) {
        setInviteCode(response.data.inviteCode);
        setShowInviteModal(true);
      }
    } catch {
      alert("초대 코드 생성에 실패했습니다.");
    }
  }, [selectedTeam]);

  const handleJoinTeam = useCallback(async () => {
    if (!joinCode.trim()) {
      alert("초대 코드를 입력해주세요.");
      return;
    }

    try {
      const response = await teamService.joinTeam({ inviteCode: joinCode });
      if (response.data) {
        alert("팀에 가입했습니다.");
        setShowJoinModal(false);
        setJoinCode("");
        await refreshTeams();
      }
    } catch {
      alert("팀 가입에 실패했습니다. 초대 코드를 확인해주세요.");
    }
  }, [joinCode, refreshTeams]);

  const handleLeaveTeam = useCallback(async () => {
    if (!selectedTeam) return;

    try {
      const response = await teamService.leaveTeam(selectedTeam.id);
      if (response.data) {
        alert("팀에서 나갔습니다.");
        setShowLeaveModal(false);
        setSelectedTeam(null);
        await refreshTeams();
      }
    } catch {
      alert("팀 나가기에 실패했습니다.");
    }
  }, [selectedTeam, refreshTeams]);

  const handleDeleteTeam = useCallback(async () => {
    if (!selectedTeam) return;

    try {
      const response = await teamService.deleteTeam(selectedTeam.id);
      if (response.data) {
        alert("팀이 삭제되었습니다.");
        setShowDeleteModal(false);
        setSelectedTeam(null);
        await refreshTeams();
      }
    } catch {
      alert("팀 삭제에 실패했습니다.");
    }
  }, [selectedTeam, refreshTeams]);

  const handleRemoveMember = useCallback(
    async (memberId: number) => {
      if (!selectedTeam) return;
      if (!confirm("정말 해당 멤버를 제거하시겠습니까?")) return;

      try {
        const response = await teamService.deleteMember(
          selectedTeam.id,
          memberId,
        );
        if (response.data) {
          setTeamMembers(teamMembers.filter((m) => m.memberId !== memberId));
          alert("멤버가 제거되었습니다.");
        }
      } catch {
        alert("멤버 제거에 실패했습니다.");
      }
    },
    [selectedTeam, teamMembers],
  );

  const handleEditTeam = useCallback(() => {
    if (!selectedTeam) return;
    setEditTeam({
      name: selectedTeam.name,
      description: selectedTeam.description,
    });
    setShowEditModal(true);
  }, [selectedTeam]);

  const handleSelectTeam = useCallback((team: Team) => {
    setSelectedTeam((prev) => (prev?.id === team.id ? prev : team));
  }, []);

  const handleUpdateTeam = useCallback(async () => {
    if (!selectedTeam || !editTeam.name.trim()) return;

    try {
      const response = await teamService.updateTeam(selectedTeam.id, editTeam);
      if (response.data) {
        alert("팀 정보가 수정되었습니다.");
        setShowEditModal(false);
        setSelectedTeam((prev) =>
          prev
            ? {
                ...prev,
                name: editTeam.name,
                description: editTeam.description,
              }
            : prev,
        );
        await refreshTeams();
      }
    } catch {
      alert("팀 정보 수정에 실패했습니다.");
    }
  }, [selectedTeam, editTeam, refreshTeams]);

  const getRoleBadge = useCallback((role: Role) => {
    switch (role) {
      case Role.OWNER:
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
            <Crown className="w-3 h-3" />
            오너
          </span>
        );
      case Role.MEMBER:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            멤버
          </span>
        );
    }
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="team" />

      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
              <Users className="w-8 h-8" />팀 관리
            </h1>
            <p className="text-gray-600">팀을 관리하고 팀원들과 협업하세요</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-5 h-5" />팀 생성
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserPlus className="w-5 h-5" />팀 가입
            </button>
          </div>
        </div>
      </section>

      {/* Team List & Details */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Team List */}
          <div className="md:col-span-1">
            <TeamList
              teams={teams}
              selectedTeam={selectedTeam}
              onSelectTeam={handleSelectTeam}
            />
          </div>

          {/* Team Details */}
          <div className="md:col-span-2">
            <TeamDetails
              team={selectedTeam}
              members={filteredMembers}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onInvite={handleGenerateInviteCode}
              onLeave={() => setShowLeaveModal(true)}
              onDelete={() => setShowDeleteModal(true)}
              onEdit={handleEditTeam}
              onRemoveMember={handleRemoveMember}
              getRoleBadge={getRoleBadge}
            />
          </div>
        </div>
      </section>

      {/* Invite Modal */}
      <InviteModal
        show={showInviteModal}
        inviteCode={inviteCode}
        onClose={() => setShowInviteModal(false)}
      />

      {/* Leave Team Modal */}
      <LeaveTeamModal
        show={showLeaveModal && selectedTeam !== null}
        teamName={selectedTeam?.name || ""}
        onClose={() => setShowLeaveModal(false)}
        onLeave={handleLeaveTeam}
      />

      {/* Delete Team Modal */}
      {showDeleteModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">팀 삭제</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                정말로 <strong>{selectedTeam.name}</strong> 팀을
                삭제하시겠습니까?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>주의:</strong> 팀 삭제 시 팀의 모든 데이터(메모, 채팅,
                  Todo 등)에 접근할 수 없게 됩니다. 이 작업은 되돌릴 수
                  없습니다.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteTeam}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      <CreateTeamModal
        show={showCreateModal}
        teamName={newTeam.name}
        teamDescription={newTeam.description}
        onClose={() => {
          setShowCreateModal(false);
          setNewTeam({ name: "", description: "" });
        }}
        onCreate={handleCreateTeam}
        onNameChange={(name) => setNewTeam({ ...newTeam, name })}
        onDescriptionChange={(description) =>
          setNewTeam({ ...newTeam, description })
        }
      />

      {/* Join Team Modal */}
      <JoinTeamModal
        show={showJoinModal}
        joinCode={joinCode}
        onClose={() => {
          setShowJoinModal(false);
          setJoinCode("");
        }}
        onJoin={handleJoinTeam}
        onCodeChange={setJoinCode}
      />

      {/* Edit Team Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              팀 정보 수정
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  팀 이름
                </label>
                <input
                  type="text"
                  value={editTeam.name}
                  onChange={(e) =>
                    setEditTeam({ ...editTeam, name: e.target.value })
                  }
                  placeholder="팀 이름을 입력하세요"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  팀 설명
                </label>
                <textarea
                  value={editTeam.description}
                  onChange={(e) =>
                    setEditTeam({ ...editTeam, description: e.target.value })
                  }
                  placeholder="팀 설명을 입력하세요"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-900 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleUpdateTeam}
                disabled={!editTeam.name.trim()}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                수정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
