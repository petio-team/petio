import { Service } from 'diod';

import { AgendaCronService } from '@/services/cron/agenda-cron';
import { Jobber } from '@/services/cron/job';
import { JobCronName } from '@/services/cron/types';
import { DiscoveryService } from '@/services/discovery/discovery';

@Service()
export class DiscoveryScanJob implements Jobber {
  constructor(
    private cronService: AgendaCronService,
    private discoverService: DiscoveryService,
  ) {}

  register(): Promise<void> {
    return this.cronService.add(
      JobCronName.DISCOVERY_SCAN,
      async () => this.discoverService.buildUserDiscovery(),
      '1 days',
      {
        lockLifetime: 1000 * 60 * 60 * 24,
      },
    );
  }
}
