import fs from 'fs/promises';
import path from 'path';
import Koa from 'koa';
import addTrailingSlashes from 'koa-add-trailing-slashes';
import mount from 'koa-mount';
import serve from 'koa-static';

import viewsConfig from "@/config/env/views";

const pathExists = async (file: string): Promise<boolean> => {
  try {
    const stat = await fs.stat(file);
    return stat.isFile();
  } catch (error) {
    return false;
  }
};

function serveReact(app: Koa, dir: string, urlPath: string) {
  const spa = new Koa();
  spa.use(addTrailingSlashes());
  spa.use(serve(dir));
  app.use(mount(urlPath, spa));
}

export default async (app: Koa) => {
  let frontendPath = viewsConfig.frontend;
  if (!(await pathExists(path.join(frontendPath, 'index.html')))) {
    const frontendBuildPath = path.join(frontendPath, './build');
    if (!(await pathExists(path.join(frontendBuildPath, './index.html')))) {
      throw new Error('unable to find views files for frontend');
    } else {
      frontendPath = frontendBuildPath;
    }
  }

  serveReact(app, frontendPath, '/');
};
