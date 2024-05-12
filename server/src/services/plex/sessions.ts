import { MediaServerEntity } from '@/resources/media-server/entity';
import { getPlexClient } from '@/services/plex/client';

export default async (server: MediaServerEntity) => {
  const client = getPlexClient(server);

  try {
    return await client.sessions.getSessions();
  } catch (e) {
    // Do nothing
    return null;
  }
};
