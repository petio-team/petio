import path from "path";

// ! This is a workaround for the fact that the process.cwd() is not the same as the root directory of the project
// ! because pkg from vercel adds an additional pkg field that points to the root directory of the project
const proc: Process = process;

type PathsConfig = {
  rootDir: string;
  appDir: string;
  dataDir: string;
  viewsDir: string;
};

const ROOT_DIR = proc.pkg ? proc.cwd() : path.join(__dirname, '../../../../..');
const APP_DIR = proc.pkg ? path.join(__dirname, "../..") : (proc.env.APP_DIR ?? path.join(__dirname, '../../../../..'));
const VIEWS_DIR = process.env.VIEWS_FOLDER ?? path.join(APP_DIR, './pkg');
const DATA_DIR = process.env.DATA_FOLDER ?? path.join(ROOT_DIR, './data');

const pathsConfig: PathsConfig = {
  rootDir: ROOT_DIR,
  appDir: APP_DIR,
  dataDir: DATA_DIR,
  viewsDir: VIEWS_DIR,
};

export default pathsConfig;
