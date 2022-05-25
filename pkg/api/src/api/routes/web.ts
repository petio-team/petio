import fs from 'fs/promises';
import Koa from 'koa';
import mount from 'koa-mount';
import serve from 'koa-static';
import path from 'path';

import { frontendView } from '@/config/env';

export default async (app: Koa) => {
  let frontendPath = path.resolve(frontendView);
  if (!pathExists(path.join(frontendPath, 'index.html'))) {
    const frontendBuildPath = path.join(frontendPath, './build');
    if (!pathExists(path.join(frontendBuildPath, './index.html'))) {
      throw new Error('unable to find views files for frontend');
    } else {
      frontendPath = frontendBuildPath;
    }
  }

  app.use(mount('/', serve(frontendPath)));
};

const pathExists = async (path: string): Promise<boolean> => {
  try {
    const file = await fs.stat(path);
    return file.isFile();
  } catch (error) {
    return false;
  }
};
