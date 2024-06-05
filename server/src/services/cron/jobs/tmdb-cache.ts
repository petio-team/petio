import { Service } from 'diod';

import { AgendaCronService } from '@/services/cron/agenda-cron';
import { Jobber } from '@/services/cron/job';
import { JobCronName } from '@/services/cron/types';
import trending from '@/services/tmdb/trending';

@Service()
export class TmdbCacheJob implements Jobber {
  constructor(private cronService: AgendaCronService) {}

  register(): Promise<void> {
    return this.cronService.add(
      JobCronName.TMDB_CACHE,
      async () => {
        await trending();
      },
      '6 hours',
      {
        lockLifetime: 1000 * 60 * 60 * 6,
      },
    );
  }
}
