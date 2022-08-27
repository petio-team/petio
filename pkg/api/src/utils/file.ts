import fs from 'fs/promises';

export const fileExists = async (file: string): Promise<boolean> => {
  try {
    const stats = await fs.stat(file);
    return stats.isFile();
  } catch (_error) {
    return false;
  }
};
