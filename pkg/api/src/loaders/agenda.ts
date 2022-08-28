import Agenda from 'agenda';

import { config } from '@/config/index';

export default ({ mongoConnection }) => {
  return new Agenda({
    mongo: mongoConnection,
    db: { address: '', collection: 'jobs' },
    processEvery: '5 minutes',
    maxConcurrency: config.get('general.concurrency'),
  });
};
