import path from 'path';

const pkg = require('@/../package.json');

const proc: Process = process;
const ROOT_DIR = proc.pkg ? path.dirname(process.execPath) : proc.cwd();
const APP_DIR: string = proc.pkg
  ? path.join(__dirname, '../../../../../')
  : proc.env.APP_DIR ?? path.join(__dirname, '../../../../');
const VIEW_DIR = process.env.VIEWS_FOLDER ?? path.join(APP_DIR, './pkg');
const DATA_DIR = process.env.DATA_FOLDER ?? path.join(ROOT_DIR, './data');
const frontendView = path.join(VIEW_DIR, './frontend');
const adminView = path.join(VIEW_DIR, './admin');
const tmdbApiKey = '1af5ad19a2d972a67cd27eb033979c4c';
// trunk-ignore(gitleaks/generic-api-key)
const fanartApiKey = 'ee409f6fb0c5cd2352e7a454d3f580d4';
const corsDomains = process.env.CORS_DOMAINS || '';

export default {
  environment: process.env.NODE_ENV ?? 'production',
  app: {
    version: '0.6.0',
    http: {
      cors: {
        domains: corsDomains,
      },
    },
  },
  paths: {
    root: ROOT_DIR,
    app: APP_DIR,
    data: DATA_DIR,
    views: VIEW_DIR,
  },
  views: {
    frontend: frontendView,
    admin: adminView,
  },
  api: {
    tmdb: {
      key: tmdbApiKey,
    },
    fanart: {
      key: fanartApiKey,
    },
  },
};
