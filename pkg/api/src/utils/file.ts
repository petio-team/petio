import fs from 'fs/promises';

import { PGID, PUID } from '@/infra/config/env';

export const fileExists = async (file: string): Promise<boolean> => {
  try {
    const stats = await fs.stat(file);
    return stats.isFile();
  } catch (_error) {
    return false;
  }
};

export const writeFile = async (file: string, data: any): Promise<void> => {
  try {
    await fs.writeFile(file, data);
    await fs.chown(file, PUID, PGID);
  } catch (error) {
    throw new Error(`Failed to write file: ${error}`);
  }
};
