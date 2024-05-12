import fs from 'fs';
import Koa from 'koa';
import addTrailingSlashes from 'koa-add-trailing-slashes';
import mount from 'koa-mount';
import serve from 'koa-static';
import { join } from 'path';

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
  const viewsPath = process.pkg
    ? join(__dirname, '../web')
    : join(__dirname, '../../../../web/build');

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
