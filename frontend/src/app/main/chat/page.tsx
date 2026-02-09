"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MessageSquare,
  Send,
  Search,
  Hash,
  Lock,
  Users,
  Plus,
  MoreVertical,
  Smile,
  Paperclip,
  X,
} from "lucide-react";
import Header from "@/src/component/Header";
import ChannelList from "@/src/component/chat/ChannelList";
import MessageList from "@/src/component/chat/MessageList";
import MessageInput from "@/src/component/chat/MessageInput";
import CreateChannelModal from "@/src/component/chat/CreateChannelModal";
import ChatStats from "@/src/component/chat/ChatStats";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { channelService } from "@/src/features/channel/service/channelService";
import { teamService } from "@/src/features/team/service/teamService";
import { messageService } from "@/src/features/message/service/messageService";
import { ChannelListRes } from "@/src/features/channel/types/channel";
import {
  MessageRes,
  SendMessageDto,
} from "@/src/features/message/types/message";

export default function ChatPage() {
  const { user } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<ChannelListRes | null>(
    null,
  );
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [channels, setChannels] = useState<ChannelListRes[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [teams, setTeams] = useState<{ teamId: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MessageRes[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  // 팀 목록 불러오기
  useEffect(() => {
    const fetchTeams = async () => {
      if (!user) {
        console.log("User is not loaded yet");
        return;
      }

      try {
        console.log("Fetching teams...");
        const response = await teamService.getTeam();
        console.log("Teams response:", response);
        if (response.success && response.data.length > 0) {
          setTeams(response.data);
          setTeamId(response.data[0].teamId); // 첫 번째 팀 기본 선택
          console.log("Team ID set to:", response.data[0].teamId);
        } else {
          console.log("No teams found or unsuccessful response");
        }
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      }
    };

    fetchTeams();
  }, [user]);

  // 채널 목록 불러오기
  useEffect(() => {
    const fetchChannels = async () => {
      if (!user || teamId === null) return;

      setIsLoading(true);
      try {
        const response = await channelService.getChannels(teamId);
        if (response.success) {
          setChannels(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch channels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [user, teamId]);

  // 메시지 목록 불러오기
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChannel) {
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      try {
        const response = await messageService.getChatHistory(
          selectedChannel.id,
        );
        if (response.success) {
          setMessages(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedChannel]);

  // 검색 디바운싱 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 채널 필터링 (useMemo로 최적화)
  const filteredChannels = useMemo(() => {
    return channels.filter((channel) =>
      channel.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
    );
  }, [channels, debouncedSearchQuery]);

  const currentMessages = messages;

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedChannel) return;

    try {
      const sendMessageDto: SendMessageDto = {
        content: messageInput,
      };

      await messageService.sendMessage(selectedChannel.id, sendMessageDto);

      // 메시지 전송 후 다시 불러오기 (실제로는 WebSocket으로 실시간 업데이트)
      const response = await messageService.getChatHistory(selectedChannel.id);
      if (response.success) {
        setMessages(response.data);
      }

      setMessageInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [messageInput, selectedChannel]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  const handleCreateChannel = useCallback(async () => {
    if (!newChannelName.trim() || teamId === null) return;

    try {
      console.log("Creating channel:", { teamId, name: newChannelName });
      const response = await channelService.createChannel(teamId, {
        name: newChannelName,
      });

      console.log("Create channel response:", response);

      if (response.success) {
        // 채널 목록 다시 불러오기
        const channelsResponse = await channelService.getChannels(teamId);
        if (channelsResponse.success) {
          setChannels(channelsResponse.data);
        }

        setShowCreateChannelModal(false);
        setNewChannelName("");
      } else {
        alert(
          "채널 생성에 실패했습니다: " +
            (response.message || "알 수 없는 오류"),
        );
      }
    } catch (error) {
      console.error("Failed to create channel:", error);
      alert("채널 생성 중 오류가 발생했습니다. 콘솔을 확인하세요.");
    }
  }, [newChannelName, teamId]);

  const handleDeleteChannel = useCallback(
    async (channelId: number) => {
      if (!teamId) return;
      if (!confirm("정말 이 채널을 삭제하시겠습니까?")) return;

      try {
        const response = await channelService.deleteChannel(teamId, channelId);
        if (response.success) {
          // 채널 목록 다시 불러오기
          const channelsResponse = await channelService.getChannels(teamId);
          if (channelsResponse.success) {
            setChannels(channelsResponse.data);
          }

          // 삭제된 채널이 선택된 채널이면 선택 해제
          if (selectedChannel?.id === channelId) {
            setSelectedChannel(null);
          }

          alert("채널이 삭제되었습니다.");
        }
      } catch (error) {
        console.error("Failed to delete channel:", error);
        alert("채널 삭제에 실패했습니다.");
      }
    },
    [teamId, selectedChannel],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="chat" />

      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
              <MessageSquare className="w-8 h-8" />
              채팅
            </h1>
            <p className="text-gray-600">팀원들과 실시간으로 소통하세요</p>
          </div>
          <div className="flex items-center gap-3">
            {teams.length > 1 && (
              <select
                value={teamId || ""}
                onChange={(e) => setTeamId(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                {teams.map((team) => (
                  <option key={team.teamId} value={team.teamId}>
                    {team.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => setShowCreateChannelModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-5 h-5" />새 채널
            </button>
          </div>
        </div>

        {/* Stats */}
        <ChatStats
          totalChannels={channels.length}
          participatingChannels={channels.length}
        />
      </section>

      {/* Chat Interface */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        {teamId === null ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              팀이 없습니다
            </h3>
            <p className="text-gray-600 mb-4">
              채팅을 사용하려면 먼저 팀에 가입하거나 팀을 생성해야 합니다.
            </p>
            <a
              href="/main/team"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              팀 페이지로 이동
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-[600px] flex">
            {/* Channel List Sidebar */}
            <ChannelList
              channels={filteredChannels}
              selectedChannel={selectedChannel}
              searchQuery={searchQuery}
              isLoading={isLoading}
              onChannelSelect={setSelectedChannel}
              onSearchChange={setSearchQuery}
            />

            {/* Message Area */}
            <div className="flex-1 flex flex-col">
              {selectedChannel ? (
                <>
                  {/* Channel Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-gray-600" />
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {selectedChannel.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          생성일:{" "}
                          {new Date(
                            selectedChannel.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteChannel(selectedChannel.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="채널 삭제"
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <MessageList
                      messages={currentMessages}
                      currentUserId={user?.id}
                      isLoading={isLoadingMessages}
                    />
                  </div>

                  {/* Message Input */}
                  <MessageInput
                    messageInput={messageInput}
                    onMessageChange={setMessageInput}
                    onSend={handleSendMessage}
                    onKeyPress={handleKeyPress}
                  />
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
          </div>
        )}
      </section>

      {/* 채널 생성 모달 */}
      <CreateChannelModal
        show={showCreateChannelModal && teamId !== null}
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
