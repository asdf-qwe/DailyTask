// 메시지 작성자 정보
export interface MessageAuthor {
  id: number;
  name: string;
}

// 메시지 응답
export interface MessageRes {
  id: number;
  channelId: number;
  author: MessageAuthor;
  content: string;
  createdAt: string; // LocalDateTime -> ISO 8601 문자열
}

// 메시지 전송 요청
export interface SendMessageDto {
  content: string;
}
