import fs, { mkdir } from 'fs/promises';
import path from 'path';
import { z } from 'zod';

import { DATA_DIR } from '@/infrastructure/config/env';
import logger from '@/infrastructure/logger/logger';
import is from '@/infrastructure/utils/is';

const MainConfigSchema = z.object({
  DB_URL: z.string().url().min(1),
  discord_webhook: z
    .string()
    .regex(
      /^.*(discord|discordapp).com\/api\/webhooks\/([\d]+)\/([a-zA-Z0-9_.-]*)$/,
    )
    .optional(),
  telegram_bot_token: z.string().min(1).optional(),
  telegram_bot_id: z.string().min(1).optional(),
  telegram_send_silent: z.string().min(1).optional(),
  plexPopular: z.boolean().default(false),
  base_path: z.string().default('/'),
  plexProtocol: z.string().min(1),
  plexIp: z.string().min(1),
  plexPort: z.coerce.number(),
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
  emailEnabled: z.boolean().default(false),
  emailUser: z.string(),
  emailPass: z.string(),
  emailServer: z.string(),
  emailPort: z.coerce.number().default(53),
  emailSecure: z.boolean().default(false),
  emailFrom: z.string().default('From Petio'),
});
export type EmailConfig = z.infer<typeof EmailConfigSchema>;

const ArrConfigSchema = z.object({
  uuid: z.string().uuid().min(1),
  title: z.string().min(1),
  protocol: z.string().min(1),
  hostname: z.string().min(1),
  port: z.coerce.number().positive(),
  apiKey: z.string().min(1),
  urlBase: z.string().min(1),
  path: z.coerce.number().optional(),
  path_title: z.string().min(1).optional(),
  profile: z.coerce.number().optional(),
  profile_title: z.string().min(1).optional(),
  active: z.boolean().default(false),
});
export type ArrConfig = z.infer<typeof ArrConfigSchema>;

const FinalOutputSchema = z.object({
  main: MainConfigSchema.optional(),
  email: EmailConfigSchema.optional(),
  sonarr: ArrConfigSchema.array().optional(),
  radarr: ArrConfigSchema.array().optional(),
});
export type FinalOutput = z.infer<typeof FinalOutputSchema>;

export type Configs = {
  file: string;
  schema: z.ZodSchema;
};

const configFiles: Configs[] = [
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
    schema: ArrConfigSchema.array(),
  },
  {
    file: 'radarr',
    schema: ArrConfigSchema.array(),
  },
];

export const hasFiles = async () => {
  const files = await Promise.all(
    configFiles.map(async (file) => {
      try {
        const filePath = path.join(DATA_DIR, `${file.file}.json`);
        const stat = await fs.stat(filePath);
        if (stat.isFile()) {
          return file;
        }
        return undefined;
      } catch (error) {
        return undefined;
      }
    }),
  );
  return files.filter(is.truthy);
};

export const parseFiles = async (configs: Configs[]) => {
  const files = await Promise.all(
    configs.map(async (file) => {
      try {
        const filePath = path.join(DATA_DIR, `${file.file}.json`);
        const content = await fs.readFile(filePath);
        const toJSON = JSON.parse(content.toString());
        const parsed = await file.schema.safeParseAsync(toJSON);
        if (!parsed.success) {
          logger.error(
            `failed to parse config '${file.file}.json'`,
            parsed.error,
          );
          return undefined;
        }
        return { [file.file]: parsed.data };
      } catch (error) {
        return undefined;
      }
    }),
  );
  return files.filter(is.truthy);
};

export const mergeFiles = async (): Promise<FinalOutput> => {
  const results = await parseFiles(configFiles);
  const mergedResults = results.reduce(
    (acc, curr) => ({ ...acc, ...curr }),
    {},
  );
  const outputResults = await FinalOutputSchema.safeParseAsync(mergedResults);
  if (outputResults.success) {
    return outputResults.data;
  }
  return {};
};

export const backupOldFiles = async () => {
  const backupFolder = path.join(DATA_DIR, 'migration-backup');
  await mkdir(backupFolder, { recursive: true });
  logger.info('Backing up old migration files to backup folder');
  await Promise.all(
    configFiles.map(async (file) => {
      try {
        const filePath = path.join(DATA_DIR, `${file.file}.json`);
        const backupPath = path.join(backupFolder, `${file.file}.json`);
        await fs.rename(filePath, backupPath);
      } catch (error) {
        logger.error(`failed to backup ${file.file}.json`, error);
      }
    }),
  );
};
