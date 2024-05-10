import { PlexClient } from '@/infra/plex';
import { MediaServerEntity } from '@/resources/media-server/entity';

export function getPlexClient(server: MediaServerEntity) {
  const client = new PlexClient({
    BASE: server.url,
    HEADERS: {
      'X-Plex-Token': server.token,
    },
  });
  return client;
}
