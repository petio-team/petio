import { config } from '@/config/index';

import { IData } from './ipc';

// Handle events passed by workers
export const masterHandler = (_data: IData) => {};

// Handle events passed by workers and master
export const workerHandler = (data: IData) => {
  if (data.action === 'update_config') {
    config.load(data.data);
  }
};
