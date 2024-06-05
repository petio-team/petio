import { Service } from 'diod';

import { AgendaCronService } from '@/services/cron/agenda-cron';
import { Jobber } from '@/services/cron/job';
import { JobCronName } from '@/services/cron/types';

@Service()
export class ImdbCacheJob implements Jobber {
  constructor(private cronService: AgendaCronService) {}

  register(): Promise<void> {
    return this.cronService.add(
      JobCronName.TMDB_CACHE,
      async () => {},
      '1 days',
      {
        lockLifetime: 1000 * 60 * 60 * 24,
      },
    );
  }
}
