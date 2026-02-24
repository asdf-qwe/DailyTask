export interface MessageAuthor {
  id: number;
  name: string;
}

export interface MessageRes {
  id: number;
  channelId: number;
  author: MessageAuthor;
  content: string;
  createdAt: string;
}

export interface SendMessageDto {
  content: string;
}
