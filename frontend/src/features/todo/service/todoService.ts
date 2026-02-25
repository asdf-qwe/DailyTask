import { authApi } from "@/src/features/auth/service/authService";
import {
  CreateTodoReq,
  CreateTodoRes,
  CreateTeamTodoRes,
  TodoListRes,
  TodoSummary,
  TodoSearchCond,
  UpdateTodoReq,
  UpdateTodoRes,
} from "../types/todo";

export const todoService = {
  /**
   * 개인 Todo 생성
   */
  createTodo: async (req: CreateTodoReq): Promise<CreateTodoRes> => {
    const response = await authApi.post("/api/v1/todos/my", req);
    return response.data.data;
  },

  /**
   * 팀 Todo 생성
   */
  createTeamTodo: async (
    teamId: number,
    req: CreateTodoReq,
  ): Promise<CreateTeamTodoRes> => {
    const response = await authApi.post(`/api/v1/teams/${teamId}/todos`, req);
    return response.data.data;
  },

  /**
   * 개인 Todo 목록 조회
   */
  getTodoList: async (
    page: number = 0,
    size: number = 10,
    cond?: TodoSearchCond,
  ): Promise<TodoListRes> => {
    const params = {
      page,
      size,
      sort: "createdAt,desc",
      ...cond,
    };
    const response = await authApi.get("/api/v1/todos/my", { params });
    return response.data.data;
  },

  /**
   * 팀 Todo 목록 조회
   */
  getTeamTodoList: async (
    teamId: number,
    page: number = 0,
    size: number = 10,
    cond?: TodoSearchCond,
  ): Promise<TodoListRes> => {
    const params = {
      page,
      size,
      sort: "createdAt,desc",
      ...cond,
    };
    const response = await authApi.get(`/api/v1/teams/${teamId}/todos`, {
      params,
    });
    return response.data.data;
  },

  /**
   * 대시보드용 개인 다가오는 Todo 목록 조회
   */
  getUpcomingTodo: async (): Promise<TodoSummary[]> => {
    const response = await authApi.get("/api/v1/todos/upcoming");
    return response.data.data;
  },

  /**
   * 대시보드용 팀 다가오는 Todo 목록 조회
   */
  getUpcomingTeamTodo: async (): Promise<TodoSummary[]> => {
    const response = await authApi.get("/api/v1/todos/team/upcoming");
    return response.data.data;
  },

  /**
   * Todo 수정
   */
  updateTodo: async (
    todoId: number,
    req: UpdateTodoReq,
  ): Promise<UpdateTodoRes> => {
    const response = await authApi.patch(`/api/v1/todos/${todoId}`, req);
    return response.data.data;
  },

  /**
   * Todo 삭제
   */
  deleteTodo: async (todoId: number): Promise<boolean> => {
    const response = await authApi.delete(`/api/v1/todos/${todoId}`);
    return response.data.data;
  },
};
