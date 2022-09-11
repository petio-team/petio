import fs from 'fs/promises';
import Koa from 'koa';
import addTrailingSlashes from 'koa-add-trailing-slashes';
import mount from 'koa-mount';
import serve from 'koa-static';
import path from 'path';

import env from '@/config/env';

export default async (app: Koa) => {
  let frontendPath = env.views.frontend;
  if (!(await pathExists(path.join(frontendPath, 'index.html')))) {
    const frontendBuildPath = path.join(frontendPath, './build');
    if (!(await pathExists(path.join(frontendBuildPath, './index.html')))) {
      throw new Error('unable to find views files for frontend');
    } else {
      frontendPath = frontendBuildPath;
    }
  }

  let adminPath = env.views.admin;
  if (!(await pathExists(path.join(adminPath, 'index.html')))) {
    const adminBuildPath = path.join(adminPath, './build');
    if (!(await pathExists(path.join(adminBuildPath, './index.html')))) {
      throw new Error('unable to find views files for admin');
    } else {
      adminPath = adminBuildPath;
    }
  }

  serveReact(app, frontendPath, '/');
  serveReact(app, adminPath, '/admin');
};

const pathExists = async (file: string): Promise<boolean> => {
  try {
    const stat = await fs.stat(file);
    return stat.isFile();
  } catch (error) {
    return false;
  }
};

function serveReact(app: Koa, dir: string, path: string) {
  const spa = new Koa();
  spa.use(addTrailingSlashes());
  spa.use(serve(dir));
  app.use(mount(path, spa));
}
