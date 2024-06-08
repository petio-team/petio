import { Service } from 'diod';

import { AgendaCronService } from '@/services/cron/agenda-cron-service';
import { Jobber } from '@/services/cron/job';
import { JobCronName } from '@/services/cron/types';
import { MovieService } from '@/services/movie/movie';

@Service()
export class ResourceCacheJob implements Jobber {
  constructor(
    private cronService: AgendaCronService,
    private movieService: MovieService,
  ) {}

  register(): Promise<void> {
    return this.cronService.add(
      JobCronName.RESOURCE_CACHE,
      async () => {
        await Promise.all([this.movieService.getTrending()]);
      },
      '6 hours',
      {
        lockLifetime: 1000 * 60 * 60 * 6,
      },
    );
  }
}
