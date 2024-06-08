import { Service } from 'diod';

import { AgendaCronService } from '@/services/cron/agenda-cron-service';
import { Jobber } from '@/services/cron/job';
import { JobCronName } from '@/services/cron/types';
import { ScannerService } from '@/services/scanner/scanner-service';

@Service()
export class UsersScanJob implements Jobber {
  constructor(
    private cronService: AgendaCronService,
    private scannerService: ScannerService,
  ) {}

  register(): Promise<void> {
    return this.cronService.add(
      JobCronName.USERS_SCAN,
      async () => {
        await this.scannerService.syncUsers();
      },
      '10 minutes',
      {
        lockLifetime: 1000 * 60 * 10,
      },
    );
  }
}
