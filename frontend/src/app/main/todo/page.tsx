"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  List,
} from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import Header from "@/src/component/Header";
import TodoCreateModal from "@/src/component/todo/TodoCreateModal";
import TodoEditModal from "@/src/component/todo/TodoEditModal";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { useTeam } from "@/src/features/team/context/TeamContext";
import { Role } from "@/src/features/team/types/team";
import { todoService } from "@/src/features/todo/service/todoService";
import {
  TodoSummary,
  TodoStatus,
  CreateTodoReq,
  UpdateTodoReq,
  CalendarRes,
} from "@/src/features/todo/types/todo";

export default function TodoPage() {
  const { isLoading: authLoading } = useAuth();
  const { teams: cachedTeams } = useTeam();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<TodoSummary | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [displayMode, setDisplayMode] = useState<"list" | "calendar">(
    "calendar",
  );

  const [viewMode, setViewMode] = useState<"personal" | "team">("personal");
  const [teams, setTeams] = useState<
    { teamId: number; name: string; role: Role }[]
  >([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    dueDate: "",
  });

  const [editFormData, setEditFormData] = useState({
    title: "",
    date: "",
    status: TodoStatus.TODO,
  });

  useEffect(() => {
    setTeams(cachedTeams);
    if (cachedTeams.length > 0 && selectedTeamId === null) {
      setSelectedTeamId(cachedTeams[0].teamId);
    }
  }, [cachedTeams, selectedTeamId]);

  const isTeamOwner = useMemo(() => {
    if (viewMode !== "team") return true;
    if (selectedTeamId === null) return false;

    return (
      teams.find((team) => team.teamId === selectedTeamId)?.role === Role.OWNER
    );
  }, [viewMode, selectedTeamId, teams]);

  const { data: todoPage, isLoading } = useQuery({
    queryKey: ["todos", viewMode, selectedTeamId, page, filterStatus],
    queryFn: async () => {
      const cond =
        filterStatus !== "all"
          ? { status: filterStatus as TodoStatus }
          : undefined;

      if (viewMode === "personal") {
        return await todoService.getTodoList(page, 20, cond);
      }

      if (selectedTeamId === null) {
        return { content: [] as TodoSummary[], totalElements: 0 };
      }

      return await todoService.getTeamTodoList(selectedTeamId, page, 20, cond);
    },
    enabled: !authLoading,
  });

  const { data: calendarTodos = [] } = useQuery<CalendarRes[]>({
    queryKey: ["todos", "calendar"],
    queryFn: () => todoService.getCalendarTodoList(),
    enabled: !authLoading && displayMode === "calendar",
  });

  const calendarEvents = useMemo(() => {
    const statusColorMap: Record<TodoStatus, string> = {
      [TodoStatus.TODO]: "#9ca3af",
      [TodoStatus.IN_PROGRESS]: "#60a5fa",
      [TodoStatus.DONE]: "#34d399",
    };
    return calendarTodos.map((todo) => ({
      id: String(todo.id),
      title: todo.teamName ? `[${todo.teamName}] ${todo.title}` : todo.title,
      date: todo.dueDate,
      backgroundColor: statusColorMap[todo.todoStatus],
      borderColor: statusColorMap[todo.todoStatus],
      extendedProps: { todo },
    }));
  }, [calendarTodos]);

  const todos = todoPage?.content ?? [];
  const totalElements = todoPage?.totalElements ?? 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredAndSortedTodos = useMemo(() => {
    return todos
      .filter((todo) => {
        const matchesSearch =
          debouncedSearchQuery === "" ||
          todo.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "dueDate") {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (sortBy === "status") {
          const statusOrder = {
            [TodoStatus.TODO]: 0,
            [TodoStatus.IN_PROGRESS]: 1,
            [TodoStatus.DONE]: 2,
          };
          return statusOrder[a.todoStatus] - statusOrder[b.todoStatus];
        }
        return 0;
      });
  }, [todos, debouncedSearchQuery, sortBy]);

  const handleCreateTodo = useCallback(async () => {
    try {
      const req: CreateTodoReq = {
        title: formData.title,
        dueDate: formData.dueDate,
      };

      if (viewMode === "personal") {
        await todoService.createTodo(req);
      } else {
        if (selectedTeamId === null) {
          alert("팀을 선택해주세요.");
          return;
        }
        await todoService.createTeamTodo(selectedTeamId, req);
      }

      setShowCreateModal(false);
      setFormData({ title: "", dueDate: "" });
      await queryClient.invalidateQueries({ queryKey: ["todos"] });
    } catch {
      alert("Todo 생성에 실패했습니다.");
    }
  }, [formData, viewMode, selectedTeamId, queryClient]);

  const handleStatusChange = useCallback(
    async (todoId: number, newStatus: TodoStatus) => {
      if (viewMode === "team" && !isTeamOwner) {
        alert("팀 Todo는 오너만 상태를 변경할 수 있습니다.");
        return;
      }

      try {
        const todo = todos.find((t) => t.id === todoId);
        if (!todo) return;

        const req: UpdateTodoReq = {
          title: todo.title,
          date: todo.dueDate,
          status: newStatus,
        };

        await todoService.updateTodo(todoId, req);
        await queryClient.invalidateQueries({ queryKey: ["todos"] });
      } catch {
        alert("상태 변경에 실패했습니다.");
      }
    },
    [todos, queryClient, viewMode, isTeamOwner],
  );

  const handleDeleteTodo = useCallback(
    async (todoId: number) => {
      if (viewMode === "team" && !isTeamOwner) {
        alert("팀 Todo는 오너만 삭제할 수 있습니다.");
        return;
      }

      if (!confirm("정말 삭제하시겠습니까?")) return;

      try {
        await todoService.deleteTodo(todoId);
        await queryClient.invalidateQueries({ queryKey: ["todos"] });
      } catch {
        alert("삭제에 실패했습니다.");
      }
    },
    [queryClient, viewMode, isTeamOwner],
  );

  const handleEditTodo = useCallback(
    (todo: TodoSummary) => {
      if (viewMode === "team" && !isTeamOwner) {
        alert("팀 Todo는 오너만 수정할 수 있습니다.");
        return;
      }

      setSelectedTodo(todo);
      setEditFormData({
        title: todo.title,
        date: todo.dueDate,
        status: todo.todoStatus,
      });
      setShowEditModal(true);
    },
    [viewMode, isTeamOwner],
  );

  const handleUpdateTodo = useCallback(async () => {
    if (!selectedTodo) return;

    if (viewMode === "team" && !isTeamOwner) {
      alert("팀 Todo는 오너만 수정할 수 있습니다.");
      return;
    }

    try {
      const req: UpdateTodoReq = {
        title: editFormData.title,
        date: editFormData.date,
        status: editFormData.status,
      };

      await todoService.updateTodo(selectedTodo.id, req);
      setShowEditModal(false);
      setSelectedTodo(null);
      await queryClient.invalidateQueries({ queryKey: ["todos"] });
    } catch {
      alert("수정에 실패했습니다.");
    }
  }, [selectedTodo, editFormData, queryClient, viewMode, isTeamOwner]);

  const getStatusColor = (status: TodoStatus) => {
    switch (status) {
      case TodoStatus.TODO:
        return "bg-gray-100 text-gray-700";
      case TodoStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-700";
      case TodoStatus.DONE:
        return "bg-green-100 text-green-700";
    }
  };

  const getStatusText = (status: TodoStatus) => {
    switch (status) {
      case TodoStatus.TODO:
        return "할 일";
      case TodoStatus.IN_PROGRESS:
        return "진행중";
      case TodoStatus.DONE:
        return "완료";
    }
  };

  const getDueDateStatus = useCallback((dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return { text: "기한 초과", color: "text-red-600", isOverdue: true };
    if (diffDays === 0)
      return { text: "오늘", color: "text-orange-600", isOverdue: false };
    if (diffDays === 1)
      return { text: "내일", color: "text-orange-500", isOverdue: false };
    if (diffDays <= 3)
      return {
        text: `${diffDays}일 남음`,
        color: "text-yellow-600",
        isOverdue: false,
      };
    return {
      text: `${diffDays}일 남음`,
      color: "text-gray-600",
      isOverdue: false,
    };
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
      <Header currentPage="todo" />

      <section className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
                <CheckSquare className="w-8 h-8" />
                Todo
              </h1>
              <p className="text-gray-600">
                할 일을 관리하고 진행 상황을 추적하세요
              </p>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDisplayMode("calendar")}
                title="캘린더 보기"
                className={`p-2 rounded-lg transition-colors ${
                  displayMode === "calendar"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Calendar className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDisplayMode("list")}
                title="리스트 보기"
                className={`p-2 rounded-lg transition-colors ${
                  displayMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {viewMode === "team" && teams.length > 0 && (
              <select
                value={selectedTeamId || ""}
                onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                {teams.map((team) => (
                  <option key={team.teamId} value={team.teamId}>
                    {team.name}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("personal")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "personal"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                개인
              </button>
              <button
                onClick={() => setViewMode("team")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  viewMode === "team"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Users className="w-4 h-4" />팀
              </button>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-5 h-5" />새 Todo
            </button>
          </div>
        </div>

        {displayMode === "list" && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Todo 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none cursor-pointer hover:bg-gray-50"
                >
                  <option value="all">모든 상태</option>
                  <option value={TodoStatus.TODO}>할 일</option>
                  <option value={TodoStatus.IN_PROGRESS}>진행중</option>
                  <option value={TodoStatus.DONE}>완료</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none cursor-pointer hover:bg-gray-50"
                >
                  <option value="dueDate">마감일순</option>
                  <option value="status">상태순</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-12">
        {displayMode === "calendar" ? (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="ko"
              events={calendarEvents}
              height="auto"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,dayGridWeek",
              }}
              buttonText={{
                today: "오늘",
                month: "월",
                week: "주",
              }}
              eventClick={(info: EventClickArg) => {
                const todo = info.event.extendedProps.todo as CalendarRes;
                alert(
                  `제목: ${todo.title}\n마감일: ${todo.dueDate}\n상태: ${
                    todo.todoStatus === TodoStatus.TODO
                      ? "할 일"
                      : todo.todoStatus === TodoStatus.IN_PROGRESS
                        ? "진행중"
                        : "완료"
                  }${todo.teamName ? `\n팀: ${todo.teamName}` : ""}`,
                );
              }}
              eventContent={(arg) => (
                <div className="truncate px-1 py-0.5 text-xs font-medium text-white">
                  {arg.event.title}
                </div>
              )}
            />
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500 font-medium">범례</span>
              <span className="flex items-center gap-1 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full bg-gray-500 inline-block" />
                할 일
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />
                진행중
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                완료
              </span>
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {filteredAndSortedTodos.map((todo) => {
              const dueDateStatus = getDueDateStatus(todo.dueDate);
              const canManage = viewMode === "personal" || isTeamOwner;
              return (
                <div
                  key={todo.id}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  {/* 제목 */}
                  <span
                    className={`flex-1 text-sm font-medium text-gray-900 truncate ${
                      todo.todoStatus === TodoStatus.DONE
                        ? "line-through text-gray-400"
                        : ""
                    }`}
                  >
                    {todo.title}
                  </span>

                  {/* 팀명 */}
                  {"name" in todo && todo.name && (
                    <span className="text-xs text-gray-500 shrink-0">
                      {String(todo.name)}
                    </span>
                  )}

                  {/* 마감일 */}
                  <span className={`text-xs shrink-0 ${dueDateStatus.color}`}>
                    {new Date(todo.dueDate).toLocaleDateString()} ·{" "}
                    {dueDateStatus.text}
                  </span>

                  {/* 기한 초과 플래그 */}
                  {dueDateStatus.isOverdue && (
                    <span className="text-red-500 text-xs shrink-0">⚑</span>
                  )}

                  {/* 상태 토글 */}
                  {canManage ? (
                    <div className="inline-flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 shrink-0">
                      {[
                        TodoStatus.TODO,
                        TodoStatus.IN_PROGRESS,
                        TodoStatus.DONE,
                      ].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(todo.id, status)}
                          className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                            todo.todoStatus === status
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-500 hover:text-gray-800"
                          }`}
                        >
                          {getStatusText(status)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${getStatusColor(todo.todoStatus)}`}
                    >
                      {getStatusText(todo.todoStatus)}
                    </span>
                  )}

                  {/* 액션 버튼 */}
                  {canManage && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEditTodo(todo)}
                        className="p-1.5 rounded-lg hover:bg-gray-100"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {displayMode === "list" &&
          !isLoading &&
          filteredAndSortedTodos.length === 0 && (
            <div className="text-center py-12">
              <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">검색 결과가 없습니다</p>
            </div>
          )}
      </section>

      <TodoCreateModal
        show={showCreateModal}
        formData={formData}
        isTeamMode={viewMode === "team"}
        teamName={
          viewMode === "team" && selectedTeamId
            ? teams.find((t) => t.teamId === selectedTeamId)?.name || ""
            : ""
        }
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTodo}
        onFormChange={setFormData}
      />

      <TodoEditModal
        show={showEditModal}
        formData={editFormData}
        onClose={() => setShowEditModal(false)}
        onUpdate={handleUpdateTodo}
        onFormChange={setEditFormData}
        getStatusText={getStatusText}
      />
    </div>
  );
}
