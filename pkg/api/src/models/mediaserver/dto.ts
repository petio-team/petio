export enum MediaServerType {
  Plex = 'plex',
}

export type MediaServerID = string;

export interface IMediaServer {
  id: MediaServerID;
  type: MediaServerType;
  name: string;
  url: URL;
  token: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
