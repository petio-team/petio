import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

import { DATA_DIR } from '@/infra/config/env';
import logger from '@/infra/logger/logger';
import is from '@/utils/is';

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

const FinalOutputSchema = z.object({
  main: MainConfigSchema.optional(),
  email: EmailConfigSchema.optional(),
  sonarrs: ArrConfigSchema.array().optional(),
  radarrs: ArrConfigSchema.array().optional(),
});
export type FinalOutput = z.infer<typeof FinalOutputSchema>;

export type Configs = {
  file: string;
  schema: z.ZodSchema;
  field?: string;
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
    file: 'sonarrs',
    schema: ArrConfigSchema.array(),
  },
  {
    file: 'radarrs',
    schema: ArrConfigSchema.array(),
  },
];

export const hasFiles = async () => {
  const files = await Promise.all(
    configFiles.map(async (file) => {
      try {
        const filePath = path.join(DATA_DIR, `${file}.json`);
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
      const filePath = path.join(DATA_DIR, `${file}.json`);
      const content = await fs.readFile(filePath);
      const parsed = await file.schema.safeParseAsync(content);
      if (!parsed.success) {
        logger.error(`failed to parse config '${file}.json'`);
        return undefined;
      }
      return { [file.file]: parsed.data };
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
