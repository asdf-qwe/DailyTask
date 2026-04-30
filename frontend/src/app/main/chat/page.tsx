"use client";

import { Suspense } from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MessageSquare,
  Hash,
  Users,
  Plus,
  X,
  FileText,
  CheckSquare,
  Trash2,
  Edit,
  Lock,
  Search,
} from "lucide-react";
import Header from "@/src/component/Header";
import MessageList from "@/src/component/chat/MessageList";
import MessageInput from "@/src/component/chat/MessageInput";
import MemoCreateModal from "@/src/component/memo/MemoCreateModal";
import MemoDetailModal from "@/src/component/memo/MemoDetailModal";
import { useToast } from "@/src/component/ui/Toast";

import { useAuth } from "@/src/features/auth/context/AuthContext";
import { useTeam } from "@/src/features/team/context/TeamContext";
import { channelService } from "@/src/features/channel/service/channelService";
import { teamService } from "@/src/features/team/service/teamService";
import { messageService } from "@/src/features/message/service/messageService";
import { ChannelListRes } from "@/src/features/channel/types/channel";
import {
  MessageRes,
  SendMessageDto,
} from "@/src/features/message/types/message";
import { TeamMemberListRes, Role } from "@/src/features/team/types/team";
import { memoService } from "@/src/features/memo/service/memoSercice";
import { todoService } from "@/src/features/todo/service/todoService";
import {
  MemoSummary,
  MemoRes,
  CreateMemoReq,
  UpdateMemoReq,
  Visibility,
} from "@/src/features/memo/types/memo";
import { TodoSummary, TodoStatus } from "@/src/features/todo/types/todo";

interface Team {
  id: number;
  name: string;
  memberCount: number;
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}

function ChatPageContent() {
  const { user, isLoading: authLoading } = useAuth();
  const { teams: cachedTeams } = useTeam();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  // 팀 관련 상태 (읽기 전용)
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMemberListRes[]>([]);
  const [activePanel, setActivePanel] = useState<
    "members" | "memo" | "todo" | null
  >("todo");
  const [teamMemos, setTeamMemos] = useState<MemoSummary[]>([]);
  const [memoTotalElements, setMemoTotalElements] = useState(0);
  const [memoPage, setMemoPage] = useState(0);
  const [memoSearch, setMemoSearch] = useState("");
  const [teamTodos, setTeamTodos] = useState<TodoSummary[]>([]);
  const [isLoadingPanel, setIsLoadingPanel] = useState(false);
  // 메모 모달 상태
  const [showMemoCreate, setShowMemoCreate] = useState(false);
  const [showMemoDetail, setShowMemoDetail] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<MemoRes | null>(null);
  const [memoFormData, setMemoFormData] = useState({
    title: "",
    content: "",
    visibility: Visibility.TEAM,
  });
  const [memoEditMode, setMemoEditMode] = useState(false);
  const memoPageSize = 10;

  // 채널 관련 상태
  const [channels, setChannels] = useState<ChannelListRes[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChannelListRes | null>(
    null,
  );
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [confirmDeleteChannelId, setConfirmDeleteChannelId] = useState<
    number | null
  >(null);

  // 메시지 관련 상태
  const [messages, setMessages] = useState<MessageRes[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // 현재 선택된 팀 객체
  const teams = useMemo<Team[]>(
    () =>
      cachedTeams.map((team) => ({
        id: team.teamId,
        name: team.name,
        memberCount: team.memberCount,
      })),
    [cachedTeams],
  );

  const selectedTeam = useMemo(
    () => teams.find((t) => t.id === selectedTeamId) || null,
    [teams, selectedTeamId],
  );

  const requestedTeamId = useMemo(() => {
    const value = searchParams.get("teamId");
    const parsed = value ? Number(value) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParams]);

  const requestedChannelId = useMemo(() => {
    const value = searchParams.get("channelId");
    const parsed = value ? Number(value) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParams]);

  // =============== 팀 정보 불러오기 (읽기 전용) ===============

  useEffect(() => {
    if (teams.length === 0) {
      setSelectedTeamId(null);
      return;
    }

    setSelectedTeamId((prev) => {
      if (
        requestedTeamId !== null &&
        teams.some((team) => team.id === requestedTeamId)
      ) {
        return requestedTeamId;
      }
      if (prev !== null && teams.some((team) => team.id === prev)) {
        return prev;
      }
      return teams[0].id;
    });
  }, [teams, requestedTeamId]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!selectedTeamId) return;
      try {
        const response = await teamService.getTeamMembers(selectedTeamId);
        if (response.data) {
          setTeamMembers(response.data);
        }
      } catch {}
    };
    fetchMembers();
  }, [selectedTeamId]);

  useEffect(() => {
    const fetchChannels = async () => {
      if (!user || selectedTeamId === null) {
        setChannels([]);
        return;
      }
      setIsLoadingChannels(true);
      try {
        const response = await channelService.getChannels(selectedTeamId);
        if (response.data) {
          setChannels(response.data);
        }
      } catch {
      } finally {
        setIsLoadingChannels(false);
      }
    };
    fetchChannels();
    setSelectedChannel(null);
    setMessages([]);
  }, [user, selectedTeamId]);

  useEffect(() => {
    if (!requestedChannelId || channels.length === 0) return;

    const matchedChannel = channels.find(
      (channel) => channel.id === requestedChannelId,
    );

    if (matchedChannel) {
      setSelectedChannel(matchedChannel);
    }
  }, [channels, requestedChannelId]);

  const handleCreateChannel = useCallback(async () => {
    if (!newChannelName.trim() || selectedTeamId === null) return;
    try {
      const response = await channelService.createChannel(selectedTeamId, {
        name: newChannelName,
      });
      if (response.data) {
        const channelsRes = await channelService.getChannels(selectedTeamId);
        if (channelsRes.data) {
          setChannels(channelsRes.data);
        }
        setShowCreateChannelModal(false);
        setNewChannelName("");
      } else {
        toast(
          "채널 생성에 실패했습니다: " +
            (response.message || "알 수 없는 오류"),
          "error",
        );
      }
    } catch {
      toast("채널 생성 중 오류가 발생했습니다.", "error");
    }
  }, [newChannelName, selectedTeamId]);

  const handleDeleteChannel = useCallback(
    async (channelId: number) => {
      if (!selectedTeamId) return;
      try {
        const response = await channelService.deleteChannel(
          selectedTeamId,
          channelId,
        );
        if (response.data) {
          const channelsRes = await channelService.getChannels(selectedTeamId);
          if (channelsRes.data) {
            setChannels(channelsRes.data);
          }
          if (selectedChannel?.id === channelId) {
            setSelectedChannel(null);
          }
          toast("채널이 삭제되었습니다.", "success");
          setConfirmDeleteChannelId(null);
        }
      } catch {
        toast("채널 삭제에 실패했습니다.", "error");
      }
    },
    [selectedTeamId, selectedChannel],
  );

  useEffect(() => {
    if (!selectedChannel || !selectedTeamId) {
      setMessages([]);
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let isCancelled = false;

    const setup = async () => {
      setIsLoadingMessages(true);
      try {
        const response = await messageService.getChatHistory(
          selectedChannel.id,
        );
        if (!isCancelled && response.data) {
          setMessages(response.data);
        }
      } catch {
      } finally {
        if (!isCancelled) setIsLoadingMessages(false);
      }

      try {
        await messageService.connectWebSocket();
        if (!isCancelled) {
          unsubscribe = messageService.subscribeToChannel(
            selectedTeamId,
            selectedChannel.id,
            (newMessage: MessageRes) => {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMessage.id)) return prev;
                return [...prev, newMessage];
              });
            },
          );
        }
      } catch {}
    };

    setup();

    return () => {
      isCancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [selectedChannel, selectedTeamId]);

  useEffect(() => {
    return () => {
      messageService.disconnectWebSocket();
    };
  }, []);

  const fetchMemos = useCallback(async () => {
    if (!selectedTeamId) return;
    setIsLoadingPanel(true);
    try {
      const res = await memoService.getMemoList(
        selectedTeamId,
        memoPage,
        memoPageSize,
      );
      if (res.data) {
        setTeamMemos(res.data.items);
        setMemoTotalElements(res.data.totalElements);
      }
    } catch {
    } finally {
      setIsLoadingPanel(false);
    }
  }, [selectedTeamId, memoPage, memoPageSize]);

  useEffect(() => {
    if (!selectedTeamId) return;
    if (activePanel === "memo") {
      fetchMemos();
    } else if (activePanel === "todo") {
      setIsLoadingPanel(true);
      todoService
        .getTeamTodoList(selectedTeamId, 0, 10)
        .then((res) => setTeamTodos(res.content))
        .catch(() => {})
        .finally(() => setIsLoadingPanel(false));
    }
  }, [activePanel, selectedTeamId, memoPage, fetchMemos]);

  const handleOpenMemoCreate = useCallback(() => {
    setMemoFormData({ title: "", content: "", visibility: Visibility.TEAM });
    setMemoEditMode(false);
    setShowMemoCreate(true);
  }, []);

  const handleSaveMemo = useCallback(async () => {
    if (
      !memoFormData.title.trim() ||
      !memoFormData.content.trim() ||
      !selectedTeamId
    )
      return;
    try {
      if (memoEditMode && selectedMemo) {
        const req: UpdateMemoReq = {
          title: memoFormData.title,
          content: memoFormData.content,
          visibility: memoFormData.visibility,
        };
        await memoService.updateMemo(selectedMemo.id, req);
        setShowMemoCreate(false);
        setShowMemoDetail(false);
        setSelectedMemo(null);
      } else {
        const req: CreateMemoReq = {
          title: memoFormData.title,
          content: memoFormData.content,
          visibility: memoFormData.visibility,
        };
        await memoService.createMemo(selectedTeamId, req);
        setShowMemoCreate(false);
      }
      fetchMemos();
    } catch {
      toast("메모 저장에 실패했습니다.", "error");
    }
  }, [memoFormData, memoEditMode, selectedMemo, selectedTeamId, fetchMemos]);

  const handleOpenMemoDetail = useCallback(
    (memoId: number) => {
      const params = new URLSearchParams();
      if (selectedTeamId) params.set("teamId", String(selectedTeamId));
      if (selectedChannel) params.set("channelId", String(selectedChannel.id));
      router.push(`/main/memo/${memoId}?${params.toString()}`);
    },
    [router, selectedTeamId, selectedChannel],
  );

  const handleEditMemo = useCallback((memo: MemoRes) => {
    setMemoFormData({
      title: memo.title,
      content: memo.content,
      visibility: memo.visibility,
    });
    setMemoEditMode(true);
    setSelectedMemo(memo);
    setShowMemoDetail(false);
    setShowMemoCreate(true);
  }, []);

  const handleDeleteMemo = useCallback(
    async (id: number) => {
      try {
        await memoService.deleteMemo(id);
        setShowMemoDetail(false);
        setSelectedMemo(null);
        fetchMemos();
      } catch {
        toast("메모 삭제에 실패했습니다.", "error");
      }
    },
    [fetchMemos],
  );

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedChannel || !selectedTeamId) return;
    try {
      const sendMessageDto: SendMessageDto = { content: messageInput };
      messageService.sendMessage(
        selectedTeamId,
        selectedChannel.id,
        sendMessageDto,
      );
      setMessageInput("");
    } catch {}
  }, [messageInput, selectedChannel, selectedTeamId]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
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
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Header currentPage="chat" />

      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* 왼쪽: 팀 목록 사이드바 */}
        <div className="w-16 bg-gray-900 flex flex-col items-center py-4 gap-2">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeamId(team.id)}
              title={team.name}
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                selectedTeamId === team.id
                  ? "bg-white text-gray-900 shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
              }`}
            >
              {team.name.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>

        {selectedTeamId ? (
          <>
            {/* 가운데: 채널 목록 */}
            <div className="w-60 bg-gray-800 flex flex-col text-white">
              {/* 팀 헤더 */}
              <div className="p-3 border-b border-gray-700">
                <h2 className="font-bold text-white text-sm truncate">
                  {selectedTeam?.name}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedTeam?.memberCount}명 · {channels.length}개 채널
                </p>
              </div>

              {/* 채널 목록 */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-2 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
                    채널
                  </span>
                  {!showCreateChannelModal && (
                    <button
                      onClick={() => setShowCreateChannelModal(true)}
                      title="채널 생성"
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* 인라인 채널 생성 폼 */}
                {showCreateChannelModal && (
                  <div className="px-2 pb-2">
                    <input
                      type="text"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateChannel();
                        if (e.key === "Escape") {
                          setShowCreateChannelModal(false);
                          setNewChannelName("");
                        }
                      }}
                      placeholder="채널 이름"
                      autoFocus
                      className="w-full px-2 py-1 bg-gray-700 text-white text-sm rounded placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-400 mb-1"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={handleCreateChannel}
                        disabled={!newChannelName.trim()}
                        className="flex-1 py-1 text-xs bg-white text-gray-900 rounded hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        만들기
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateChannelModal(false);
                          setNewChannelName("");
                        }}
                        className="flex-1 py-1 text-xs bg-gray-600 text-gray-300 rounded hover:bg-gray-500 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}

                {isLoadingChannels ? (
                  <div className="px-3 py-4 text-center text-gray-500 text-xs">
                    로딩 중...
                  </div>
                ) : channels.length > 0 ? (
                  channels.map((channel) => (
                    <div
                      key={channel.id}
                      className={`group flex items-center gap-2 px-3 py-1.5 mx-1 rounded text-sm transition-colors cursor-pointer ${
                        selectedChannel?.id === channel.id
                          ? "bg-gray-600 text-white"
                          : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                      }`}
                      style={{ width: "calc(100% - 8px)" }}
                      onClick={() => setSelectedChannel(channel)}
                    >
                      <Hash className="w-4 h-4 flex-shrink-0 opacity-60" />
                      <span className="truncate flex-1">{channel.name}</span>
                      {confirmDeleteChannelId === channel.id && (
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setConfirmDeleteChannelId(null)}
                        />
                      )}
                      {confirmDeleteChannelId === channel.id ? (
                        <div
                          className="flex items-center gap-1 relative z-20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setConfirmDeleteChannelId(null)}
                            className="text-xs px-1.5 py-0.5 rounded hover:bg-gray-600 text-gray-300"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => handleDeleteChannel(channel.id)}
                            className="text-xs px-1.5 py-0.5 rounded bg-red-500 text-white hover:bg-red-600"
                          >
                            삭제
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteChannelId(channel.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500 hover:text-white rounded transition-all"
                          title="채널 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-gray-500 text-xs">
                    채널이 없습니다
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽: 메시지 영역 */}
            <div className="flex-1 min-h-0 flex flex-col bg-white">
              {selectedChannel ? (
                <>
                  {/* 채널 헤더 */}
                  <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-5 h-5 text-gray-500" />
                      <h3 className="font-bold text-gray-900">
                        {selectedChannel.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setActivePanel(activePanel === "todo" ? null : "todo")
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          activePanel === "todo"
                            ? "bg-gray-100 text-gray-900"
                            : "hover:bg-gray-100 text-gray-500"
                        }`}
                        title="팀 Todo"
                      >
                        <CheckSquare className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          setActivePanel(activePanel === "memo" ? null : "memo")
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          activePanel === "memo"
                            ? "bg-gray-100 text-gray-900"
                            : "hover:bg-gray-100 text-gray-500"
                        }`}
                        title="팀 메모"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          setActivePanel(
                            activePanel === "members" ? null : "members",
                          )
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          activePanel === "members"
                            ? "bg-gray-100 text-gray-900"
                            : "hover:bg-gray-100 text-gray-500"
                        }`}
                        title="멤버 목록"
                      >
                        <Users className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* 메시지 + 멤버 패널 */}
                  <div className="flex-1 min-h-0 flex overflow-hidden">
                    <div className="flex-1 min-h-0 flex flex-col">
                      {/* 메시지 목록 */}
                      <div className="flex-1 min-h-0">
                        <MessageList
                          messages={messages}
                          currentUserId={user?.id}
                          isLoading={isLoadingMessages}
                        />
                      </div>

                      {/* 메시지 입력 */}
                      <MessageInput
                        messageInput={messageInput}
                        onMessageChange={setMessageInput}
                        onSend={handleSendMessage}
                        onKeyPress={handleKeyPress}
                      />
                    </div>

                    {/* 사이드 패널 */}
                    {activePanel && (
                      <div className="w-60 border-l border-gray-200 bg-gray-50 flex flex-col">
                        {activePanel === "members" && (
                          <>
                            <div className="p-3 border-b border-gray-200">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                멤버 — {teamMembers.length}
                              </h4>
                            </div>
                            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                              {teamMembers.map((member) => (
                                <div
                                  key={member.memberId}
                                  className="px-3 py-2 flex items-center gap-2"
                                >
                                  <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-medium">
                                      {member.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm font-medium text-gray-900 truncate">
                                        {member.name}
                                      </span>
                                      {member.role === Role.OWNER && (
                                        <span className="text-xs text-purple-600">
                                          👑
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {activePanel === "memo" && (
                          <>
                            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                팀 메모
                              </h4>
                              <button
                                onClick={handleOpenMemoCreate}
                                className="flex items-center gap-1 px-2 py-1 bg-gray-900 text-white rounded text-xs hover:bg-gray-800 transition-colors"
                              >
                                <Plus className="w-3 h-3" /> 새 메모
                              </button>
                            </div>
                            <div className="px-3 py-2 border-b border-gray-200">
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded">
                                <Search className="w-3.5 h-3.5 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="메모 검색..."
                                  value={memoSearch}
                                  onChange={(e) =>
                                    setMemoSearch(e.target.value)
                                  }
                                  className="flex-1 text-xs outline-none text-gray-900 placeholder-gray-400"
                                />
                              </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                              {isLoadingPanel ? (
                                <div className="p-4 text-center text-gray-400 text-xs">
                                  로딩 중...
                                </div>
                              ) : teamMemos.filter(
                                  (m) =>
                                    memoSearch === "" ||
                                    m.title
                                      .toLowerCase()
                                      .includes(memoSearch.toLowerCase()),
                                ).length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                  {teamMemos
                                    .filter(
                                      (m) =>
                                        memoSearch === "" ||
                                        m.title
                                          .toLowerCase()
                                          .includes(memoSearch.toLowerCase()),
                                    )
                                    .map((memo) => (
                                      <div
                                        key={memo.id}
                                        className="group px-3 py-2.5 hover:bg-white cursor-pointer transition-colors"
                                        onClick={() =>
                                          handleOpenMemoDetail(memo.id)
                                        }
                                      >
                                        <div className="flex items-start justify-between gap-1">
                                          <p className="text-sm font-medium text-gray-900 truncate flex-1">
                                            {memo.title}
                                          </p>
                                          {memo.visibility ===
                                          Visibility.PRIVATE ? (
                                            <Lock className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                                          ) : null}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                          {memo.authorName} ·{" "}
                                          {new Date(
                                            memo.createdAt,
                                          ).toLocaleDateString()}
                                        </p>
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <div className="p-4 text-center text-gray-400 text-xs">
                                  {memoSearch
                                    ? "검색 결과가 없습니다"
                                    : "메모가 없습니다"}
                                </div>
                              )}
                            </div>
                            {memoTotalElements > memoPageSize && (
                              <div className="p-2 border-t border-gray-200 flex items-center justify-between">
                                <button
                                  onClick={() =>
                                    setMemoPage((p) => Math.max(0, p - 1))
                                  }
                                  disabled={memoPage === 0}
                                  className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  이전
                                </button>
                                <span className="text-xs text-gray-500">
                                  {memoPage + 1} /{" "}
                                  {Math.ceil(memoTotalElements / memoPageSize)}
                                </span>
                                <button
                                  onClick={() =>
                                    setMemoPage((p) =>
                                      Math.min(
                                        Math.ceil(
                                          memoTotalElements / memoPageSize,
                                        ) - 1,
                                        p + 1,
                                      ),
                                    )
                                  }
                                  disabled={
                                    memoPage >=
                                    Math.ceil(
                                      memoTotalElements / memoPageSize,
                                    ) -
                                      1
                                  }
                                  className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  다음
                                </button>
                              </div>
                            )}
                          </>
                        )}

                        {activePanel === "todo" && (
                          <>
                            <div className="p-3 border-b border-gray-200">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                팀 Todo
                              </h4>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                              {isLoadingPanel ? (
                                <div className="p-4 text-center text-gray-400 text-xs">
                                  로딩 중...
                                </div>
                              ) : teamTodos.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                  {teamTodos.map((todo) => (
                                    <div key={todo.id} className="px-3 py-2">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {todo.title}
                                      </p>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span
                                          className={`text-xs px-1.5 py-0.5 rounded ${
                                            todo.todoStatus === TodoStatus.DONE
                                              ? "bg-green-100 text-green-700"
                                              : todo.todoStatus ===
                                                  TodoStatus.IN_PROGRESS
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-gray-100 text-gray-600"
                                          }`}
                                        >
                                          {todo.todoStatus === TodoStatus.DONE
                                            ? "완료"
                                            : todo.todoStatus ===
                                                TodoStatus.IN_PROGRESS
                                              ? "진행중"
                                              : "대기"}
                                        </span>
                                        {todo.dueDate && (
                                          <span className="text-xs text-gray-400">
                                            {new Date(
                                              todo.dueDate,
                                            ).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-4 text-center text-gray-400 text-xs">
                                  Todo가 없습니다
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium mb-2">
                      채널을 선택해주세요
                    </p>
                    <p className="text-gray-400 text-sm">
                      왼쪽 목록에서 채널을 선택하면 대화를 시작할 수 있습니다
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                팀이 없습니다
              </h3>
              <p className="text-gray-600 mb-4">
                채팅을 시작하려면 먼저 팀 페이지에서 팀에 가입하세요.
              </p>
              <a
                href="/main/team"
                className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                팀 페이지로 이동
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 메모 생성/수정 모달 */}
      <MemoCreateModal
        show={showMemoCreate}
        formData={memoFormData}
        teams={cachedTeams}
        teamId={selectedTeamId}
        isEditMode={memoEditMode}
        onClose={() => {
          setShowMemoCreate(false);
          setMemoFormData({
            title: "",
            content: "",
            visibility: Visibility.TEAM,
          });
          setMemoEditMode(false);
        }}
        onSave={handleSaveMemo}
        onFormChange={setMemoFormData}
        onTeamChange={() => {}}
      />

      {/* 메모 상세 모달 */}
      <MemoDetailModal
        show={showMemoDetail}
        memo={selectedMemo}
        onClose={() => {
          setShowMemoDetail(false);
          setSelectedMemo(null);
        }}
        onEdit={handleEditMemo}
        onDelete={handleDeleteMemo}
      />
    </div>
  );
}
