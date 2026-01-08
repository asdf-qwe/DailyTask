import axios from "axios";
import {
  CreateTodoReq,
  CreateTodoRes,
  CreateTeamTodoRes,
  TodoListRes,
  TodoSearchCond,
  UpdateTodoReq,
  UpdateTodoRes,
} from "../types/todo";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const todoApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const todoService = {
  /**
   * 개인 Todo 생성
   */
  createTodo: async (req: CreateTodoReq): Promise<CreateTodoRes> => {
    const response = await todoApi.post("/api/v1/todos/my", req);
    return response.data.data;
  },

  /**
   * 팀 Todo 생성
   */
  createTeamTodo: async (
    teamId: number,
    req: CreateTodoReq
  ): Promise<CreateTeamTodoRes> => {
    const response = await todoApi.post(`/api/v1/teams/${teamId}/todos`, req);
    return response.data.data;
  },

  /**
   * 개인 Todo 목록 조회
   */
  getTodoList: async (
    page: number = 0,
    size: number = 10,
    cond?: TodoSearchCond
  ): Promise<TodoListRes> => {
    const params = {
      page,
      size,
      sort: "createdAt,desc",
      ...cond,
    };
    const response = await todoApi.get("/api/v1/todos/my", { params });
    return response.data.data;
  },

  /**
   * 팀 Todo 목록 조회
   */
  getTeamTodoList: async (
    teamId: number,
    page: number = 0,
    size: number = 10,
    cond?: TodoSearchCond
  ): Promise<TodoListRes> => {
    const params = {
      page,
      size,
      sort: "createdAt,desc",
      ...cond,
    };
    const response = await todoApi.get(`/api/v1/teams/${teamId}/todos`, {
      params,
    });
    return response.data.data;
  },

  /**
   * Todo 수정
   */
  updateTodo: async (
    todoId: number,
    req: UpdateTodoReq
  ): Promise<UpdateTodoRes> => {
    const response = await todoApi.patch(`/api/v1/todos/${todoId}`, req);
    return response.data.data;
  },

  /**
   * Todo 삭제
   */
  deleteTodo: async (todoId: number): Promise<boolean> => {
    const response = await todoApi.delete(`/api/v1/todos/${todoId}`);
    return response.data.data;
  },
};
