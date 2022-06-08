import Agenda from 'agenda';

export default ({ mongoConnection }) => {
  return new Agenda({
    mongo: mongoConnection,
    db: { address: '', collection: 'jobs' },
    processEvery: '5 minutes',
    maxConcurrency: 10,
  });
};
