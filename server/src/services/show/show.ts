import pino from 'pino';

import { Logger } from '@/infrastructure/logger/logger';
import { showLookup } from '@/services/tmdb/show';

export class ShowService {
  private logger: pino.Logger;

  constructor(logger: Logger) {
    this.logger = logger.child({ module: 'services.show' });
  }

  async getBatchedShows(ids: number[], minified: boolean = false) {
    const showResult = await Promise.all(
      ids.map((m) => showLookup(m, minified)),
    );
    return showResult;
  }
}
