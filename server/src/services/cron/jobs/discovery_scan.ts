import { Service } from 'diod';

import { AgendaCronService } from '@/services/cron/agenda-cron';
import { Jobber } from '@/services/cron/job';
import { JobCronName } from '@/services/cron/types';
import discovery from '@/services/discovery';

@Service()
export class JobDiscoveryScan implements Jobber {
  constructor(private cronService: AgendaCronService) {}

  register(): Promise<void> {
    return this.cronService.add(
      JobCronName.DISCOVERY_SCAN,
      async () => discovery(),
      '1 days',
      {
        lockLifetime: 1000 * 60 * 60 * 2,
      },
    );
  }
}
