export enum TodoStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export interface CreateTeamTodoRes {
  id: number;
  title: string;
  teamId: number;
  dueDate: string; // ISO 8601 date format
  todoStatus: TodoStatus;
}

export interface CreateTodoReq {
  title: string;
  dueDate: string; // ISO 8601 date format
}

export interface CreateTodoRes {
  id: number;
  title: string;
  dueDate: string; // ISO 8601 date format
  todoStatus: TodoStatus;
}

export interface TodoSummary {
  id: number;
  title: string;
  dueDate: string; // ISO 8601 date format
  todoStatus: TodoStatus;
}

export interface TodoListRes {
  content: TodoSummary[];
  page: number;
  size: number;
  totalElements: number;
}

export interface TodoSearchCond {
  date?: string; // ISO 8601 date format
  status?: TodoStatus;
}

export interface UpdateTodoReq {
  title: string;
  date: string; // ISO 8601 date format
  status: TodoStatus;
}

export interface UpdateTodoRes {
  id: number;
  updatedAt: string; // ISO 8601 datetime format
}
