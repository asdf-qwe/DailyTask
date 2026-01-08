// 메모 작성자 정보
export interface MemoAuthor {
  id: number;
  name: string;
}

// 메모 생성 요청 DTO
export interface CreateMemoReq {
  title: string;
  content: string;
  sharedToTeam?: boolean;
}

// 메모 생성 응답 DTO
export interface CreateMemoRes {
  id: number;
  teamId: number;
  title: string;
  content: string;
  sharedToTeam: boolean;
  author: MemoAuthor;
  createdAt: string; // ISO 8601 형식
}

// 메모 요약 정보 (목록용)
export interface MemoSummary {
  id: number;
  title: string;
  preview: string;
  authorName: string;
  sharedToTeam: boolean;
  createdAt: string; // ISO 8601 형식
}

// 메모 리스트 응답 DTO (페이징 포함)
export interface MemoListRes {
  items: MemoSummary[];
  page: number;
  size: number;
  totalElements: number;
}

// 메모 상세 응답 DTO
export interface MemoRes {
  id: number;
  teamId: number;
  title: string;
  content: string;
  author: MemoAuthor;
  sharedToTeam: boolean;
  createdAt: string; // ISO 8601 형식
}

// 메모 검색 조건 DTO
export interface MemoSearchCond {
  authorId?: number;
  startDate?: string; // ISO 8601 형식
  endDate?: string; // ISO 8601 형식
}

// 메모 수정 요청 DTO
export interface UpdateMemoReq {
  title: string;
  content: string;
  sharedToTeam?: boolean;
}

// 메모 수정 응답 DTO
export interface UpdateMemoRes {
  id: number;
  title: string;
  updatedAt: string; // ISO 8601 형식
}
