/* eslint-disable max-classes-per-file */
import { Zodios } from '@zodios/core';
import { pluginApi } from '@zodios/plugins';

import { APIv2 } from './v2/api';
import { User } from './v2/user';

// eslint-disable-next-line import/prefer-default-export
export const PlexTVAPIClient = new Zodios('https://plex.tv', [...APIv2])
  .use(pluginApi());

export abstract class Requester {
  abstract getUser(token: string): Promise<User>;
  abstract signIn(clientId: string): Promise<User>;
}

export class PlexTVClientV2 {
  private client = new Zodios('https://plex.tv', [...APIv2]).use(pluginApi());
}
