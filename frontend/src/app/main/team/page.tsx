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
import TeamStats from "@/src/component/team/TeamStats";
import TeamList from "@/src/component/team/TeamList";
import TeamDetails from "@/src/component/team/TeamDetails";
import InviteModal from "@/src/component/team/InviteModal";
import CreateTeamModal from "@/src/component/team/CreateTeamModal";
import JoinTeamModal from "@/src/component/team/JoinTeamModal";
import LeaveTeamModal from "@/src/component/team/LeaveTeamModal";
import { useAuth } from "@/src/features/auth/context/AuthContext";
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
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
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

  // 팀 목록 불러오기
  useEffect(() => {
    const fetchTeams = async () => {
      if (!user) return;

      try {
        const response = await teamService.getTeam();
        console.log("팀 목록 API 응답:", response);
        if (response.success) {
          // GetTeamRes를 Team 형식으로 변환 (이제 memberCount가 포함됨)
          const convertedTeams: Team[] = response.data.map((team) => ({
            id: team.teamId,
            name: team.name,
            description: "",
            memberCount: team.memberCount ?? 0, // 백엔드에서 받아온 값 사용 (undefined면 0)
            createdAt: "",
            role: Role.MEMBER,
          }));
          setTeams(convertedTeams);
          if (convertedTeams.length > 0 && !selectedTeam) {
            setSelectedTeam(convertedTeams[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      }
    };

    fetchTeams();
  }, [user]);

  // 선택된 팀의 멤버 목록 불러오기
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!selectedTeam) return;

      setIsLoading(true);
      try {
        const response = await teamService.getTeamMembers(selectedTeam.id);
        if (response.success) {
          setTeamMembers(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, [selectedTeam]);

  // 검색 필터링 (useMemo로 최적화)
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [teamMembers, searchQuery]);

  // 통계 계산 (useMemo로 최적화)
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
      if (response.success) {
        alert("팀이 생성되었습니다.");
        setNewTeam({ name: "", description: "" });
        setShowCreateModal(false);

        // 팀 목록 새로고침
        const teamsResponse = await teamService.getTeam();
        if (teamsResponse.success) {
          const convertedTeams: Team[] = teamsResponse.data.map((team) => ({
            id: team.teamId,
            name: team.name,
            description: "",
            memberCount: team.memberCount ?? 0, // 백엔드에서 받아온 값 사용 (undefined면 0)
            createdAt: "",
            role: Role.MEMBER,
          }));
          setTeams(convertedTeams);
          const newCreatedTeam = convertedTeams.find(
            (t) => t.id === response.data.id,
          );
          if (newCreatedTeam) {
            setSelectedTeam(newCreatedTeam);
          }
        }
      }
    } catch (error) {
      console.error("Failed to create team:", error);
      alert("팀 생성에 실패했습니다.");
    }
  }, [newTeam]);

  const handleGenerateInviteCode = useCallback(async () => {
    if (!selectedTeam) return;

    try {
      const response = await teamService.createInviteCode(selectedTeam.id, {
        expiresInHours: 24,
      });
      if (response.success) {
        setInviteCode(response.data.inviteCode);
        setShowInviteModal(true);
      }
    } catch (error) {
      console.error("Failed to create invite code:", error);
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
      if (response.success) {
        alert("팀에 가입했습니다.");
        setShowJoinModal(false);
        setJoinCode("");

        // 팀 목록 새로고침
        const teamsResponse = await teamService.getTeam();
        if (teamsResponse.success) {
          const convertedTeams: Team[] = teamsResponse.data.map((team) => ({
            id: team.teamId,
            name: team.name,
            description: "",
            memberCount: team.memberCount ?? 0,
            createdAt: "",
            role: Role.MEMBER,
          }));
          setTeams(convertedTeams);
        }
      }
    } catch (error) {
      console.error("Failed to join team:", error);
      alert("팀 가입에 실패했습니다. 초대 코드를 확인해주세요.");
    }
  }, [joinCode]);

  const handleLeaveTeam = useCallback(async () => {
    if (!selectedTeam) return;

    try {
      const response = await teamService.leaveTeam(selectedTeam.id);
      if (response.success) {
        alert("팀에서 나갔습니다.");
        setShowLeaveModal(false);
        setSelectedTeam(null);

        // 팀 목록 새로고침
        const teamsResponse = await teamService.getTeam();
        if (teamsResponse.success) {
          const convertedTeams: Team[] = teamsResponse.data.map((team) => ({
            id: team.teamId,
            name: team.name,
            description: "",
            memberCount: team.memberCount ?? 0,
            createdAt: "",
            role: Role.MEMBER,
          }));
          setTeams(convertedTeams);
        }
      }
    } catch (error) {
      console.error("Failed to leave team:", error);
      alert("팀 나가기에 실패했습니다.");
    }
  }, [selectedTeam]);

  const handleRemoveMember = useCallback(
    async (memberId: number) => {
      if (!selectedTeam) return;
      if (!confirm("정말 해당 멤버를 제거하시겠습니까?")) return;

      try {
        const response = await teamService.deleteMember(
          selectedTeam.id,
          memberId,
        );
        if (response.success) {
          setTeamMembers(teamMembers.filter((m) => m.memberId !== memberId));
          alert("멤버가 제거되었습니다.");
        }
      } catch (error) {
        console.error("Failed to remove member:", error);
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

  const handleUpdateTeam = useCallback(async () => {
    if (!selectedTeam || !editTeam.name.trim()) return;

    try {
      const response = await teamService.updateTeam(selectedTeam.id, editTeam);
      if (response.success) {
        alert("팀 정보가 수정되었습니다.");
        setShowEditModal(false);

        // 팀 목록 새로고침
        const teamsResponse = await teamService.getTeam();
        if (teamsResponse.success) {
          const convertedTeams: Team[] = teamsResponse.data.map((team) => ({
            id: team.teamId,
            name: team.name,
            description: "",
            memberCount: team.memberCount ?? 0,
            createdAt: "",
            role: Role.MEMBER,
          }));
          setTeams(convertedTeams);
          const updated = convertedTeams.find((t) => t.id === selectedTeam.id);
          if (updated) setSelectedTeam(updated);
        }
      }
    } catch (error) {
      console.error("Failed to update team:", error);
      alert("팀 정보 수정에 실패했습니다.");
    }
  }, [selectedTeam, editTeam]);

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

        {/* Stats */}
        <TeamStats
          totalTeams={stats.totalTeams}
          totalMembers={stats.totalMembers}
          ownedTeams={stats.ownedTeams}
          participatingTeams={stats.participatingTeams}
        />
      </section>

      {/* Team List & Details */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Team List */}
          <div className="md:col-span-1">
            <TeamList
              teams={teams}
              selectedTeam={selectedTeam}
              onSelectTeam={setSelectedTeam}
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
