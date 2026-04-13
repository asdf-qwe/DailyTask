export enum Visibility {
  PRIVATE = "PRIVATE",
  TEAM = "TEAM",
}

export interface MemoAuthor {
  id: number;
  name: string;
}

export interface CreateMemoReq {
  title: string;
  content: string;
  visibility: Visibility;
}

export interface CreateMemoRes {
  id: number;
  teamId: number;
  title: string;
  content: string;
  visibility: Visibility;
  author: MemoAuthor;
  createdAt: string;
}

export interface MemoSummary {
  id: number;
  title: string;
  authorName: string;
  visibility: Visibility;
  createdAt: string;
}

export interface RecentMemoRes {
  id: number;
  title: string;
  authorName: string;
  createdAt: string;
}

export interface MemoListRes {
  items: MemoSummary[];
  page: number;
  size: number;
  totalElements: number;
}

export interface MemoRes {
  id: number;
  teamId: number;
  title: string;
  content: string;
  author: MemoAuthor;
  visibility: Visibility;
  createdAt: string;
}

export interface MemoSearchCond {
  authorId?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateMemoReq {
  title: string;
  content: string;
  visibility: Visibility;
}

export interface UpdateMemoRes {
  id: number;
  title: string;
  updatedAt: string;
}
