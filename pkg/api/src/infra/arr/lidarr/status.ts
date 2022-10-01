import { asApi } from '@zodios/core';
import { z } from 'zod';

export const SystemStatusSchema = z.object({
  appName: z.string(),
  instanceName: z.string(),
  version: z.string(),
  buildTime: z.string(),
  isDebug: z.boolean(),
  isProduction: z.boolean(),
  isAdmin: z.boolean(),
  isUserInteractive: z.boolean(),
  startupPath: z.string(),
  appData: z.string(),
  osName: z.string(),
  isNetCore: z.boolean(),
  isLinux: z.boolean(),
  isOsx: z.boolean(),
  isWindows: z.boolean(),
  isDocker: z.boolean(),
  mode: z.string(),
  branch: z.string(),
  authentication: z.string(),
  sqliteVersion: z.string(),
  migrationVersion: z.number(),
  urlBase: z.string(),
  runtimeVersion: z.string(),
  runtimeName: z.string(),
  startTime: z.string(),
  packageVersion: z.string(),
  packageAuthor: z.string(),
  packageUpdateMechanism: z.string(),
});
export type SystemStatus = z.infer<typeof SystemStatusSchema>;

export const SystemStatusEndpoint = asApi([
  {
    method: 'get',
    path: '/api/v1/system/status',
    parameters: [],
    response: SystemStatusSchema,
  },
] as const);
