"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Trash2, Users, Lock, FileText } from "lucide-react";
import Header from "@/src/component/Header";
import MemoCreateModal from "@/src/component/memo/MemoCreateModal";
import { useToast } from "@/src/component/ui/Toast";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { useTeam } from "@/src/features/team/context/TeamContext";
import { memoService } from "@/src/features/memo/service/memoSercice";
import {
  MemoRes,
  UpdateMemoReq,
  Visibility,
} from "@/src/features/memo/types/memo";

export default function MemoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: authLoading } = useAuth();
  const { teams: cachedTeams } = useTeam();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const goBackToChat = useCallback(() => {
    const teamId = searchParams.get("teamId");
    const channelId = searchParams.get("channelId");
    const params = new URLSearchParams();
    if (teamId) params.set("teamId", teamId);
    if (channelId) params.set("channelId", channelId);
    router.push(`/main/chat?${params.toString()}`);
  }, [router, searchParams]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    visibility: Visibility.TEAM,
  });

  const {
    data: memo,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["memo", id],
    queryFn: async () => {
      const response = await memoService.getMemo(Number(id));
      if (!response.data) throw new Error("메모를 불러올 수 없습니다.");
      return response.data as MemoRes;
    },
    enabled: !authLoading && !!id,
  });

  const handleEdit = useCallback(() => {
    if (!memo) return;
    setFormData({
      title: memo.title,
      content: memo.content,
      visibility: memo.visibility,
    });
    setShowEditModal(true);
  }, [memo]);

  const handleUpdate = useCallback(async () => {
    if (!memo || !formData.title.trim() || !formData.content.trim()) return;

    try {
      const req: UpdateMemoReq = {
        title: formData.title,
        content: formData.content,
        visibility: formData.visibility,
      };
      const response = await memoService.updateMemo(memo.id, req);
      if (response.data) {
        setShowEditModal(false);
        await queryClient.invalidateQueries({ queryKey: ["memo", id] });
        await queryClient.invalidateQueries({ queryKey: ["memos"] });
      }
    } catch {
      toast("메모 수정에 실패했습니다.", "error");
    }
  }, [memo, id, formData, queryClient]);

  const handleDelete = useCallback(async () => {
    if (!memo) return;

    try {
      const response = await memoService.deleteMemo(memo.id);
      if (response.data) {
        await queryClient.invalidateQueries({ queryKey: ["memos"] });
        goBackToChat();
      }
    } catch {
      toast("메모 삭제에 실패했습니다.", "error");
    }
  }, [memo, queryClient, goBackToChat]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isError || !memo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="memo" />
        <div className="max-w-4xl mx-auto px-6 pt-16 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">메모를 찾을 수 없습니다.</p>
          <button
            onClick={goBackToChat}
            className="text-gray-900 underline text-sm"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="memo" />

      <section className="max-w-4xl mx-auto px-6 pt-8 pb-12">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goBackToChat}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">채팅으로 돌아가기</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm">수정</span>
            </button>
            {confirmDelete && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => setConfirmDelete(false)}
              />
            )}
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-500 text-sm transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>정말 삭제</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">삭제</span>
              </button>
            )}
          </div>
        </div>

        {/* 메모 본문 */}
        <div className="bg-white rounded-xl border border-gray-200">
          {/* 헤더 */}
          <div className="border-b border-gray-100 px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {memo.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="font-medium text-gray-700">
                {memo.author.name}
              </span>
              <span>·</span>
              <span>{new Date(memo.createdAt).toLocaleString()}</span>
              <span>·</span>
              <div className="flex items-center gap-1">
                {memo.visibility === Visibility.TEAM ? (
                  <>
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400">팀 공개</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span>비공개</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 내용 */}
          <div className="px-8 py-6">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {memo.content}
            </p>
          </div>
        </div>
      </section>

      <MemoCreateModal
        show={showEditModal}
        formData={formData}
        teams={cachedTeams}
        teamId={memo.teamId}
        isEditMode={true}
        onClose={() => {
          setShowEditModal(false);
          setFormData({
            title: memo.title,
            content: memo.content,
            visibility: memo.visibility,
          });
        }}
        onSave={handleUpdate}
        onFormChange={setFormData}
        onTeamChange={() => {}}
      />
    </div>
  );
}
