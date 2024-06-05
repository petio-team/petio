import { Service } from 'diod';

import { AgendaCronService } from '@/services/cron/agenda-cron';
import { Jobber } from '@/services/cron/job';
import { JobCronName } from '@/services/cron/types';
import QuotaSystem from '@/services/requests/quotas';

@Service()
export class QuotaResetJob implements Jobber {
  constructor(private cronService: AgendaCronService) {}

  register(): Promise<void> {
    return this.cronService.add(
      JobCronName.QUOTA_RESET,
      async () => {
        await new QuotaSystem().reset();
      },
      '12 hours',
      {
        lockLifetime: 1000 * 60 * 60 * 12,
      },
    );
  }
}
