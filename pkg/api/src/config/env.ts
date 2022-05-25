import path from 'path';

interface Process extends NodeJS.Process {
  pkg?: any;
}
const proc: Process = process;

const ROOT_DIR = proc.pkg ? path.dirname(process.execPath) : proc.cwd();
const APP_DIR: string = proc.pkg
  ? path.join(__dirname, '../../../../../')
  : proc.env.APP_DIR ?? path.join(__dirname, '../../../../');

const VIEW_FOLDER = process.env.VIEWS_FOLDER ?? path.join(APP_DIR, './pkg');

export const rootDir = ROOT_DIR;
export const env = process.env.NODE_ENV ?? 'development';
export const dataFolder =
  process.env.DATA_FOLDER ?? path.join(ROOT_DIR, './data');
export const frontendView = path.join(VIEW_FOLDER, './frontend');
export const adminView = path.join(VIEW_FOLDER, './admin');
export const tmdbApiKey = '1af5ad19a2d972a67cd27eb033979c4c';
// trunk-ignore(gitleaks/generic-api-key)
export const fanartApiKey = 'ee409f6fb0c5cd2352e7a454d3f580d4';
