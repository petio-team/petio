export type GetFriendsDataResponse = Array<{
  status: string;
  sharedServers: Array<any>;
  sharedSources: Array<any>;
  id: number;
  uuid: string;
  title: string;
  username: string;
  restricted: boolean;
  email: string;
  friendlyName?: string;
  thumb: string;
  home: boolean;
}>;
