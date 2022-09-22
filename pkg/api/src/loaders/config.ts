import { LoadConfig, WriteConfig } from '@/config/index';
import Migrate from '@/config/migration';

export default async (): Promise<boolean> => {
  let exists = false;
  if (await Migrate()) {
    await WriteConfig();
    exists = true;
  } else {
    await LoadConfig();
    exists = true;
  }
  return exists;
};
