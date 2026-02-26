export enum TodoStatus {
  TODO = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export interface CreateTeamTodoRes {
  id: number;
  title: string;
  teamId: number;
  dueDate: string;
  todoStatus: TodoStatus;
}

export interface CreateTodoReq {
  title: string;
  dueDate: string;
}

export interface CreateTodoRes {
  id: number;
  title: string;
  dueDate: string;
  todoStatus: TodoStatus;
}

export interface TodoSummary {
  id: number;
  name?: string;
  title: string;
  dueDate: string;
  todoStatus: TodoStatus;
}


export interface TodoListRes {
  content: TodoSummary[];
  page: number;
  size: number;
  totalElements: number;
}

export interface TodoSearchCond {
  date?: string;
  status?: TodoStatus;
}

export interface UpdateTodoReq {
  title: string;
  date: string;
  status: TodoStatus;
}

export interface UpdateTodoRes {
  id: number;
  updatedAt: string;
}
