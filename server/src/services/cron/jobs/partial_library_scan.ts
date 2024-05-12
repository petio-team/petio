import { Service } from 'diod';

import { MediaServerRepository } from '@/resources/media-server/repository';
import { AgendaCronService } from '@/services/cron/agenda-cron';
import { Jobber } from '@/services/cron/job';
import { JobCronName } from '@/services/cron/types';

@Service()
export class JobPartialLibraryScan implements Jobber {
  constructor(
    private cronService: AgendaCronService,
    private mediaServerRepo: MediaServerRepository,
  ) {}

  register(): Promise<void> {
    return this.cronService.add(
      JobCronName.PARTIAL_LIBRARY_SCAN,
      async () => {
        // const serverResult = await this.mediaServerRepo.findOne({});
        // if (serverResult.isSome()) {
        //   const server = serverResult.unwrap();
        //   await new LibraryUpdate(server).partial();
        // }
      },
      '6 hours',
      {
        lockLifetime: 1000 * 60 * 60 * 2,
      },
    );
  }
}
