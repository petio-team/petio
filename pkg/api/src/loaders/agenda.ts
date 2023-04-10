import { Agenda } from '@hokify/agenda';

import { config } from '@/config/index';

export default ({ mongoConnection }) => new Agenda({
    mongo: mongoConnection,
    db: { address: '', collection: 'jobs' },
    processEvery: '5 minutes',
    maxConcurrency: config.get('general.concurrency'),
  });
