import { Service } from 'diod';

import { AgendaCronService } from '@/services/cron/agenda-cron-service';
import { Jobber } from '@/services/cron/job';
import { JobCronName } from '@/services/cron/types';
import { ScannerService } from '@/services/scanner/scanner-service';

@Service()
export class LibraryScanJob implements Jobber {
  constructor(
    private cronService: AgendaCronService,
    private scannerService: ScannerService,
  ) {}

  register(): Promise<void> {
    return this.cronService.add(
      JobCronName.LIBRARY_SCAN,
      async () => {
        await this.scannerService.syncLibraries();
      },
      '30 minutes',
      {
        lockLifetime: 1000 * 60 * 30,
      },
    );
  }
}
