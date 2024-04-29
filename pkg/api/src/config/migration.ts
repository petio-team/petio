import fs from 'fs/promises';
import path from 'path';
import * as z from 'zod';

import config from '@/config/schema';
import { DATA_DIR } from '@/infra/config/env';
import logger from '@/infra/logger/logger';
import { fileExists } from '@/utils/file';

const MainConfigSchema = z.object({
  DB_URL: z.string().url().min(1),
  discord_webhook: z.string().min(1),
  telegram_bot_token: z.string().min(1),
  telegram_bot_id: z.string().min(1),
  telegram_send_silent: z.string().min(1),
  plexPopular: z.boolean(),
  base_path: z.string().min(1),
  plexProtocol: z.string().min(1),
  plexIp: z.string().min(1),
  plexPort: z.number(),
  plexToken: z.string().min(1),
  plexClientID: z.string().min(1),
  adminUsername: z.string().min(1),
  adminEmail: z.string().email().min(1),
  adminPass: z.string().min(1),
  adminId: z.string().min(1),
  adminThumb: z.string().min(1),
  adminDisplayName: z.string().min(1),
});
export type MainConfig = z.infer<typeof MainConfigSchema>;

const EmailConfigSchema = z.object({
  emailEnabled: z.boolean(),
  emailUser: z.string().min(1),
  emailPass: z.string().min(1),
  emailServer: z.string().min(1),
  emailPort: z.number(),
  emailSecure: z.boolean(),
  emailFrom: z.string().min(1),
});
export type EmailConfig = z.infer<typeof EmailConfigSchema>;

const ArrConfigSchema = z.object({
  uuid: z.string().uuid().min(1),
  title: z.string().min(1),
  protocol: z.string().min(1),
  hostname: z.string().min(1),
  port: z.number(),
  apiKey: z.string().min(1),
  urlBase: z.string().min(1),
  path: z.number(),
  path_title: z.string().min(1),
  profile: z.number(),
  profile_title: z.string().min(1),
  enabled: z.boolean(),
});
export type ArrConfig = z.infer<typeof ArrConfigSchema>;

export type ConfigUnion = MainConfig & EmailConfig & ArrConfig;

interface ConfigParse {
  file: string;
  schema: z.ZodSchema;
}

const configFiles: ConfigParse[] = [
  {
    file: 'main',
    schema: MainConfigSchema,
  },
  {
    file: 'email',
    schema: EmailConfigSchema,
  },
  {
    file: 'sonarr',
    schema: z.array(ArrConfigSchema),
  },
  {
    file: 'radarr',
    schema: z.array(ArrConfigSchema),
  },
];

const findParseAndMergeConfigs = async (): Promise<ConfigUnion> => {
  const results = await Promise.all(
    Object.values(configFiles).map(async (cfg) => {
      const file = path.join(DATA_DIR, `${cfg.file}.json`);
      const exists = await fileExists(file);
      if (exists) {
        const content = await fs.readFile(file);
        const parsed = await config.schema.safeParseAsync(content);
        if (!parsed.success) {
          logger.error(`failed to parse config '${config.file}.json`);
          return {};
        }
        return parsed.data;
      }
      return {};
    }),
  );
  const mergedResults = results.reduce(
    (acc, curr) => ({ ...acc, ...curr }),
    {},
  );
  return mergedResults;
};

export default async (): Promise<ConfigUnion | null> => {
  try {
    return await findParseAndMergeConfigs();
  } catch (error) {
    logger.error(error);
  }
  return null;
};
