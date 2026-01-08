// 채널 목록 응답
export interface ChannelListRes {
  id: number;
  name: string;
  teamName: string;
  createdAt: string; // LocalDateTime -> ISO 8601 문자열
}

// 채널 생성 요청
export interface CreateChannelReq {
  name: string;
}

// 채널 생성 응답
export interface CreateChannelRes {
  id: number;
  teamId: number;
  name: string;
  createdAt: string; // LocalDateTime -> ISO 8601 문자열
}
