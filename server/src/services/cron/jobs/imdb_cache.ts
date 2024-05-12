import { AgendaCronService } from '@/services/cron/agenda-cron';
import { Jobber } from '@/services/cron/job';
import { JobCronName } from '@/services/cron/types';
import { Service } from 'diod';

@Service()
export class JobImdbCache implements Jobber {
  constructor(
    private cronService: AgendaCronService
  ) {}

  register(): Promise<void> {
    return this.cronService.add(
      JobCronName.TMDB_CACHE,
      async () => {},
      '1 days',
      {
        lockLifetime: 1000 * 60 * 60 * 2,
      },
    );
  }
}
