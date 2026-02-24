"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Search, Filter } from "lucide-react";
import Header from "@/src/component/Header";
import MemoCard from "@/src/component/memo/MemoCard";
import MemoStats from "@/src/component/memo/MemoStats";
import MemoCreateModal from "@/src/component/memo/MemoCreateModal";
import MemoDetailModal from "@/src/component/memo/MemoDetailModal";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { useTeam } from "@/src/features/team/context/TeamContext";
import { memoService } from "@/src/features/memo/service/memoSercice";
import {
  MemoSummary,
  CreateMemoReq,
  MemoRes,
  UpdateMemoReq,
} from "@/src/features/memo/types/memo";

export default function MemoPage() {
  const { isLoading: authLoading } = useAuth();
  const { teams: cachedTeams } = useTeam();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<MemoRes | null>(null);
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [filterPublic, setFilterPublic] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [teams, setTeams] = useState<{ teamId: number; name: string }[]>([]);
  const pageSize = 10;

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    sharedToTeam: true,
  });

  useEffect(() => {
    setTeams(cachedTeams);
    if (cachedTeams.length > 0 && teamId === null) {
      setTeamId(cachedTeams[0].teamId);
      setFilterTeam(cachedTeams[0].teamId.toString());
    }
  }, [cachedTeams, teamId]);

  const { data: memoList, isLoading } = useQuery({
    queryKey: ["memos", teamId, currentPage],
    queryFn: async () => {
      if (teamId === null) {
        return { items: [] as MemoSummary[], totalElements: 0 };
      }
      const response = await memoService.getMemoList(
        teamId,
        currentPage,
        pageSize,
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch memos");
      }
      return response.data;
    },
    enabled: !authLoading && teamId !== null,
  });

  const memos = memoList?.items ?? [];
  const totalElements = memoList?.totalElements ?? 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredMemos = useMemo(() => {
    return memos.filter((memo) => {
      const matchesPublic =
        filterPublic === "all" ||
        (filterPublic === "public" && memo.sharedToTeam) ||
        (filterPublic === "private" && !memo.sharedToTeam);
      const matchesSearch =
        debouncedSearchQuery === "" ||
        memo.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      return matchesPublic && matchesSearch;
    });
  }, [memos, filterPublic, debouncedSearchQuery]);

  const handleCreateMemo = useCallback(() => {
    if (teamId === null && teams.length > 0) {
      setTeamId(teams[0].teamId);
    }

    setFormData({ title: "", content: "", sharedToTeam: true });
    setShowCreateModal(true);
  }, [teamId, teams]);

  const handleTeamFilterChange = useCallback((value: string) => {
    setFilterTeam(value);
    setCurrentPage(0);

    setTeamId(Number(value));
  }, []);

  const handleSaveMemo = useCallback(async () => {
    if (!formData.title.trim() || !formData.content.trim() || teamId === null)
      return;

    try {
      const req: CreateMemoReq = {
        title: formData.title,
        content: formData.content,
        sharedToTeam: formData.sharedToTeam,
      };

      const response = await memoService.createMemo(teamId, req);
      if (response.success) {
        setShowCreateModal(false);
        setFormData({
          title: "",
          content: "",
          sharedToTeam: true,
        });
        await queryClient.invalidateQueries({ queryKey: ["memos"] });
      }
    } catch {
      alert("메모 생성에 실패했습니다.");
    }
  }, [formData, teamId, queryClient]);

  const handleViewMemo = useCallback(async (memo: MemoSummary) => {
    try {
      const response = await memoService.getMemo(memo.id);
      if (response.success) {
        setSelectedMemo(response.data);
        setShowDetailModal(true);
      }
    } catch {}
  }, []);

  const handleEditMemo = useCallback((memo: MemoRes) => {
    setFormData({
      title: memo.title,
      content: memo.content,
      sharedToTeam: memo.sharedToTeam,
    });
    setSelectedMemo(memo);
    setShowDetailModal(false);
    setShowCreateModal(true);
  }, []);

  const handleUpdateMemo = useCallback(async () => {
    if (!selectedMemo || !formData.title.trim() || !formData.content.trim())
      return;

    try {
      const req: UpdateMemoReq = {
        title: formData.title,
        content: formData.content,
        sharedToTeam: formData.sharedToTeam,
      };

      const response = await memoService.updateMemo(selectedMemo.id, req);
      if (response.success) {
        setShowCreateModal(false);
        setSelectedMemo(null);
        setFormData({
          title: "",
          content: "",
          sharedToTeam: true,
        });
        await queryClient.invalidateQueries({ queryKey: ["memos"] });
      }
    } catch {
      alert("메모 수정에 실패했습니다.");
    }
  }, [formData, selectedMemo, queryClient]);

  const handleDeleteMemo = useCallback(
    async (memoId: number) => {
      if (!confirm("정말 삭제하시겠습니까?")) return;

      try {
        const response = await memoService.deleteMemo(memoId);
        if (response.success) {
          await queryClient.invalidateQueries({ queryKey: ["memos"] });
          setShowDetailModal(false);
        }
      } catch {}
    },
    [queryClient],
  );

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
      <Header currentPage="memo" />

      <section className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
              <FileText className="w-8 h-8" />
              메모
            </h1>
            <p className="text-gray-600">
              팀과 함께 메모를 작성하고 공유하세요
            </p>
          </div>
          <button
            onClick={handleCreateMemo}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />새 메모
          </button>
        </div>

        <MemoStats
          totalElements={totalElements}
          memos={memos}
          currentPage={currentPage}
        />

        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[300px]">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="메모 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterTeam}
                onChange={(e) => handleTeamFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none cursor-pointer hover:bg-gray-50"
              >
                {teams.map((team) => (
                  <option key={team.teamId} value={team.teamId.toString()}>
                    {team.name}
                  </option>
                ))}
              </select>
              <select
                value={filterPublic}
                onChange={(e) => setFilterPublic(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none cursor-pointer hover:bg-gray-50"
              >
                <option value="all">전체 공개여부</option>
                <option value="public">공개</option>
                <option value="private">비공개</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-12">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">메모를 불러오는 중...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMemos.map((memo) => (
                <MemoCard key={memo.id} memo={memo} onClick={handleViewMemo} />
              ))}
            </div>

            {filteredMemos.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">검색 결과가 없습니다</p>
              </div>
            )}

            {totalElements > pageSize && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <span className="px-4 py-2 text-gray-600">
                  {currentPage + 1} / {Math.ceil(totalElements / pageSize)}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(
                        Math.ceil(totalElements / pageSize) - 1,
                        currentPage + 1,
                      ),
                    )
                  }
                  disabled={
                    currentPage >= Math.ceil(totalElements / pageSize) - 1
                  }
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <MemoCreateModal
        show={showCreateModal}
        formData={formData}
        teams={teams}
        teamId={teamId}
        isEditMode={!!selectedMemo}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedMemo(null);
          setFormData({ title: "", content: "", sharedToTeam: true });
        }}
        onSave={selectedMemo ? handleUpdateMemo : handleSaveMemo}
        onFormChange={setFormData}
        onTeamChange={setTeamId}
      />

      <MemoDetailModal
        show={showDetailModal}
        memo={selectedMemo}
        onClose={() => setShowDetailModal(false)}
        onEdit={handleEditMemo}
        onDelete={handleDeleteMemo}
      />
    </div>
  );
}
