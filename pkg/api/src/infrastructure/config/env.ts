import { join } from 'node:path';
import { parseEnv, port } from 'znv';
import { z } from 'zod';

import { removeSlashes } from '@/infrastructure/utils/urls';

// Used to extend the NodeJS Process interface to include the pkg property (vercel pkg)
declare global {
  namespace NodeJS {
    interface Process {
      pkg?: any;
    }
  }
}

export const {
  NODE_ENV,
  PGID,
  PUID,
  LOG_LEVEL,
  DATABASE_URL,
  HTTP_ADDR,
  HTTP_PORT,
  HTTP_BASE_PATH,
  HTTP_TRUSTED_PROXIES,
  HTTP_CORS_DOMAINS,
  DATA_DIR,
  TMDB_API_KEY,
  FANART_API_KEY,
} = parseEnv(process.env, {
  NODE_ENV: {
    schema: z.string().min(1),
    description: 'The environment the application is running in.',
    defaults: {
      development: 'development',
      docker: 'docker',
      _: 'production',
    },
  },
  PGID: {
    schema: z.coerce.number().default(1000),
    description: 'The process GID to use.',
  },
  PUID: {
    schema: z.coerce.number().default(1000),
    description: 'The process UID to use.',
  },
  LOG_LEVEL: {
    schema: z
      .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
      .default('info'),
    description: 'The log level to use.',
  },
  DATABASE_URL: {
    schema: z.string().min(1),
    description: 'The URL to use for the database connection.',
    defaults: {
      development: 'mongodb://mongo:27017/petio',
      docker: 'mongodb://mongo:27017/petio',
      _: 'mongodb://localhost:27017/petio',
    },
  },
  HTTP_ADDR: {
    schema: z.string().min(1).default('127.0.0.1'),
    description: 'The address the HTTP server should listen on.',
  },
  HTTP_PORT: {
    schema: port().default(7777),
    description: 'The port the HTTP server should listen on.',
  },
  HTTP_BASE_PATH: {
    schema: z
      .string()
      .min(1)
      .transform((s) => `/${removeSlashes(s)}`)
      .default('/'),
    description: 'The base path to use for the HTTP server.',
  },
  HTTP_TRUSTED_PROXIES: {
    schema: z
      .string()
      .transform((value) => value.split(','))
      .default(''),
    description: 'The trusted proxies to use.',
  },
  HTTP_CORS_DOMAINS: {
    schema: z.string().transform((value) => value.split(',')),
    description: 'The CORS domains to use.',
    defaults: {
      development: 'http://localhost:3000',
      _: 'http://localhost:7777',
    },
  },
  DATA_DIR: {
    schema: z.string().min(1).default(join(process.cwd(), './data')),
    description: 'The directory to store data in.',
  },
  TMDB_API_KEY: {
    schema: z.string().min(1).default('1af5ad19a2d972a67cd27eb033979c4c'),
    description: 'The API key to use for The Movie Database.',
  },
  FANART_API_KEY: {
    schema: z.string().min(1).default('ee409f6fb0c5cd2352e7a454d3f580d4'),
    description: 'The API key to use for Fanart TV.',
  },
});
