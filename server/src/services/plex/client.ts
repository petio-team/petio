import { PlexMediaServerApiClient } from '@/infrastructure/generated/custom/plex-api-client/plex-api-client';
import { MediaServerEntity } from '@/resources/media-server/entity';

export function getPlexClient(server: MediaServerEntity) {
  const client = new PlexMediaServerApiClient({
    BASE: server.url,
    HEADERS: {
      'X-Plex-Token': server.token,
    },
  });
  return client;
}
