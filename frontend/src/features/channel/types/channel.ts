export interface ChannelListRes {
  id: number;
  name: string;
  teamName: string;
  createdAt: string;
}

export interface CreateChannelReq {
  name: string;
}

export interface CreateChannelRes {
  id: number;
  teamId: number;
  name: string;
  createdAt: string;
}
