import { Service } from 'diod';

import { AgendaCronService } from '@/services/cron/agenda-cron';
import { Jobber } from '@/services/cron/job';
import { JobCronName } from '@/services/cron/types';
import { ScannerService } from '@/services/scanner/scanner-service';

@Service()
export class ContentScanJob implements Jobber {
  constructor(
    private cronService: AgendaCronService,
    private scannerService: ScannerService,
  ) {}

  register(): Promise<void> {
    return this.cronService.add(
      JobCronName.CONTENT_SCAN,
      async () => {
        await this.scannerService.syncContent();
      },
      '1 day',
      {
        lockLifetime: 1000 * 60 * 60 * 24,
      },
    );
  }
}
