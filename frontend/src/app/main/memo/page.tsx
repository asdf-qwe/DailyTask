"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Search, Filter, Users, Lock } from "lucide-react";
import Header from "@/src/component/Header";
import MemoCreateModal from "@/src/component/memo/MemoCreateModal";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { useTeam } from "@/src/features/team/context/TeamContext";
import { memoService } from "@/src/features/memo/service/memoSercice";
import {
  MemoSummary,
  CreateMemoReq,
  Visibility,
} from "@/src/features/memo/types/memo";

export default function MemoPage() {
  const { isLoading: authLoading } = useAuth();
  const { teams: cachedTeams } = useTeam();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
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
    visibility: Visibility.TEAM,
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
      if (!response.data) {
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
        (filterPublic === "public" && memo.visibility === Visibility.TEAM) ||
        (filterPublic === "private" && memo.visibility === Visibility.PRIVATE);
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

    setFormData({ title: "", content: "", visibility: Visibility.TEAM });
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
        visibility: formData.visibility,
      };

      const response = await memoService.createMemo(teamId, req);
      if (response.data) {
        setShowCreateModal(false);
        setFormData({
          title: "",
          content: "",
          visibility: Visibility.TEAM,
        });
        await queryClient.invalidateQueries({ queryKey: ["memos"] });
      }
    } catch {
      alert("메모 생성에 실패했습니다.");
    }
  }, [formData, teamId, queryClient]);

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

        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
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
            {filteredMemos.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {filteredMemos.map((memo) => (
                  <div
                    key={memo.id}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    {/* 제목 */}
                    <span
                      className="flex-1 text-sm font-medium text-gray-900 truncate cursor-pointer hover:underline"
                      onClick={() => router.push(`/main/memo/${memo.id}`)}
                    >
                      {memo.title}
                    </span>

                    {/* 작성자 */}
                    <span className="text-xs text-gray-500 shrink-0">
                      {memo.authorName}
                    </span>

                    {/* 공개여부 */}
                    <span className="flex items-center gap-1 shrink-0">
                      {memo.visibility === Visibility.TEAM ? (
                        <>
                          <Users className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-xs text-blue-400">팀 공개</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-400">비공개</span>
                        </>
                      )}
                    </span>

                    {/* 작성일 */}
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(memo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
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
        isEditMode={false}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ title: "", content: "", visibility: Visibility.TEAM });
        }}
        onSave={handleSaveMemo}
        onFormChange={setFormData}
        onTeamChange={setTeamId}
      />
    </div>
  );
}
