import { Zodios } from '@zodios/core';
import { pluginApi } from '@zodios/plugins';

import { APIv2 } from './plextv/v2';

export const PlexTVAPI = new Zodios('https://plex.tv', [...APIv2]);

// plugin that adds application/json header to all requests
PlexTVAPI.use(pluginApi());
