import { MediaServerRepository } from '@/resources/media-server/repository';
import { AgendaCronService } from '@/services/cron/agenda-cron';
import { Jobber } from '@/services/cron/job';
import { JobCronName } from '@/services/cron/types';
import LibraryUpdate from '@/services/plex/library';

export class JobUsersScan implements Jobber {
  constructor(
    private cronService: AgendaCronService,
    private mediaServerRepo: MediaServerRepository,
  ) {}

  register(): Promise<void> {
    return this.cronService.add(
      JobCronName.USERS_SCAN,
      async () => {
        const serverResult = await this.mediaServerRepo.findOne({});
        if (serverResult.isSome()) {
          const server = serverResult.unwrap();
          new LibraryUpdate(server).scan();
        }
      },
      '10 minutes',
      {
        lockLifetime: 1000 * 60 * 60 * 2,
      },
    );
  }
}
