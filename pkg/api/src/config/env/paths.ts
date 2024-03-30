import path from "path";

type PathsConfig = {
  rootDir: string;
  appDir: string;
  dataDir: string;
  viewsDir: string;
};

const proc: Process = process;

const ROOT_DIR = proc.cwd();
const APP_DIR = proc.env.APP_DIR ?? path.join(__dirname, '../../..');
const VIEWS_DIR = process.env.VIEWS_FOLDER ?? path.join(APP_DIR, './pkg');
const DATA_DIR = process.env.DATA_FOLDER ?? path.join(ROOT_DIR, './data');

const pathsConfig: PathsConfig = {
  rootDir: ROOT_DIR,
  appDir: APP_DIR,
  dataDir: DATA_DIR,
  viewsDir: VIEWS_DIR,
};

export default pathsConfig;
