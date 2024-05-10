import fs from 'fs';
import Koa from 'koa';
import addTrailingSlashes from 'koa-add-trailing-slashes';
import mount from 'koa-mount';
import serve from 'koa-static';
import { join } from 'path';

import { NODE_ENV } from '@/infrastructure/config/env';

const pathExists = (file: string) => {
  if (fs.existsSync(file)) {
    if (fs.lstatSync(file).isFile()) {
      return true;
    }
  }
  return false;
};

function serveReact(app: Koa, dir: string, urlPath: string) {
  const spa = new Koa();
  spa.use(addTrailingSlashes());
  spa.use(serve(dir));
  app.use(mount(urlPath, spa));
}

export default (app: Koa) => {
  const viewsPath =
    NODE_ENV === 'production'
      ? join(__dirname, '../../pkg/frontend/build')
      : join(__dirname, '../../../../frontend/build');

  let frontendPath = viewsPath;
  if (!pathExists(join(frontendPath, 'index.html'))) {
    const frontendBuildPath = join(frontendPath, './build');
    if (!pathExists(join(frontendBuildPath, './index.html'))) {
      throw new Error('unable to find views files for frontend');
    } else {
      frontendPath = frontendBuildPath;
    }
  }

  serveReact(app, frontendPath, '/');
};
