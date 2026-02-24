"use client";

import { Suspense } from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare, Hash, Users, Plus, X } from "lucide-react";
import Header from "@/src/component/Header";
import MessageList from "@/src/component/chat/MessageList";
import MessageInput from "@/src/component/chat/MessageInput";
import CreateChannelModal from "@/src/component/chat/CreateChannelModal";
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

  // 팀 관련 상태 (읽기 전용)
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMemberListRes[]>([]);
  const [showMemberPanel, setShowMemberPanel] = useState(false);

  // 채널 관련 상태
  const [channels, setChannels] = useState<ChannelListRes[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChannelListRes | null>(
    null,
  );
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

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
        if (response.success) {
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
        if (response.success) {
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
      if (response.success) {
        const channelsRes = await channelService.getChannels(selectedTeamId);
        if (channelsRes.success) {
          setChannels(channelsRes.data);
        }
        setShowCreateChannelModal(false);
        setNewChannelName("");
      } else {
        alert(
          "채널 생성에 실패했습니다: " +
            (response.message || "알 수 없는 오류"),
        );
      }
    } catch {
      alert("채널 생성 중 오류가 발생했습니다.");
    }
  }, [newChannelName, selectedTeamId]);

  const handleDeleteChannel = useCallback(
    async (channelId: number) => {
      if (!selectedTeamId) return;
      if (!confirm("정말 이 채널을 삭제하시겠습니까?")) return;
      try {
        const response = await channelService.deleteChannel(
          selectedTeamId,
          channelId,
        );
        if (response.success) {
          const channelsRes = await channelService.getChannels(selectedTeamId);
          if (channelsRes.success) {
            setChannels(channelsRes.data);
          }
          if (selectedChannel?.id === channelId) {
            setSelectedChannel(null);
          }
          alert("채널이 삭제되었습니다.");
        }
      } catch {
        alert("채널 삭제에 실패했습니다.");
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
        if (!isCancelled && response.success) {
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
                  <button
                    onClick={() => setShowCreateChannelModal(true)}
                    title="채널 생성"
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>

                {isLoadingChannels ? (
                  <div className="px-3 py-4 text-center text-gray-500 text-xs">
                    로딩 중...
                  </div>
                ) : channels.length > 0 ? (
                  channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 mx-1 rounded text-sm transition-colors ${
                        selectedChannel?.id === channel.id
                          ? "bg-gray-600 text-white"
                          : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                      }`}
                      style={{ width: "calc(100% - 8px)" }}
                    >
                      <Hash className="w-4 h-4 flex-shrink-0 opacity-60" />
                      <span className="truncate">{channel.name}</span>
                    </button>
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowMemberPanel(!showMemberPanel)}
                        className={`p-2 rounded-lg transition-colors ${
                          showMemberPanel
                            ? "bg-gray-100 text-gray-900"
                            : "hover:bg-gray-100 text-gray-500"
                        }`}
                        title="멤버 목록"
                      >
                        <Users className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteChannel(selectedChannel.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="채널 삭제"
                      >
                        <X className="w-5 h-5 text-red-600" />
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

                    {/* 멤버 패널 (읽기 전용) */}
                    {showMemberPanel && (
                      <div className="w-60 border-l border-gray-200 bg-gray-50 flex flex-col">
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

      {/* 채널 생성 모달 */}
      <CreateChannelModal
        show={showCreateChannelModal && selectedTeamId !== null}
        channelName={newChannelName}
        onClose={() => {
          setShowCreateChannelModal(false);
          setNewChannelName("");
        }}
        onCreate={handleCreateChannel}
        onNameChange={setNewChannelName}
      />
    </div>
  );
}
