import fs from 'fs/promises';
import path from 'path';
import * as z from 'zod';

import env from '@/config/env';
import { WriteConfig } from '@/config/index';
import { config } from '@/config/schema';
import logger from '@/loaders/logger';
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
type MainConfig = z.infer<typeof MainConfigSchema>;

const EmailConfigSchema = z.object({
  emailEnabled: z.boolean(),
  emailUser: z.string().min(1),
  emailPass: z.string().min(1),
  emailServer: z.string().min(1),
  emailPort: z.number(),
  emailSecure: z.boolean(),
  emailFrom: z.string().min(1),
});
type EmailConfig = z.infer<typeof EmailConfigSchema>;

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
type ArrConfig = z.infer<typeof ArrConfigSchema>;

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

export const migrateConfigs = async (): Promise<void> => {
  try {
    const isModified = await findParseAndMergeConfigs();
    if (isModified) {
      await WriteConfig();
    }
  } catch (error) {
    logger.error(error);
  }
};

const findParseAndMergeConfigs = async (): Promise<boolean> => {
  let isModified = false;

  for (const config of configFiles) {
    const file = path.join(env.paths.data, `${config.file  }.json`);
    const exists = await fileExists(file);
    if (exists) {
      const content = await fs.readFile(file);
      const parsed = await config.schema.safeParseAsync(content);
      if (!parsed.success) {
        logger.error(`failed to parse config '${  config.file  }.json`);
        continue;
      }

      const output = parsed.data.toString();

      switch (config.file) {
        case 'main':
          transformMainConfig(output);
          break;
        case 'email':
          transformEmailConfig(output);
          break;
        case 'radarr':
          transformRadarrConfig(output);
          break;
        case 'sonarr':
          transformSonarrConfig(output);
      }

      isModified = true;
    }
  }

  return isModified;
};

const transformMainConfig = (data: any): void => {
  const output = data as MainConfig;
  config.set('db.url', output.DB_URL);
  config.set('notifications.discord.url', output.discord_webhook);
  config.set('notifications.telegram.id', output.telegram_bot_id);
  config.set('notifications.telegram.token', output.telegram_bot_token);
  config.set('notifications.telegram.silent', output.telegram_send_silent);
  config.set('general.popular', output.plexPopular);
  config.set('petio.subpath', output.base_path);
  config.set('plex.protocol', output.plexProtocol);
  config.set('plex.host', output.plexIp);
  config.set('plex.port', output.plexPort);
  config.set('plex.token', output.plexToken);
  config.set('plex.client', output.plexClientID);
  config.set('admin.id', output.adminId);
  config.set('admin.username', output.adminUsername);
  config.set('admin.email', output.adminEmail);
  config.set('admin.password', output.adminPass);
  config.set('admin.thumbnail', output.adminThumb);
  config.set('admin.display', output.adminDisplayName);
};

const transformEmailConfig = (data: any): void => {
  const output = data as EmailConfig;
  config.set('email.host', output.emailServer);
  config.set('email.port', output.emailPort);
  config.set('email.username', output.emailUser);
  config.set('email.password', output.emailPass);
  config.set('email.from', output.emailFrom);
  config.set('email.ssl', output.emailSecure);
  config.set('email.enabled', output.emailEnabled);
};

const transformSonarrConfig = (data: any): void => {
  const output = data as Array<ArrConfig>;
  const sonarrs: any = [];

  for (const instance of output) {
    sonarrs.push({
      uuid: instance.uuid,
      title: instance.title,
      protocol: instance.protocol,
      host: instance.hostname,
      port: instance.port,
      subpath: instance.urlBase,
      key: instance.apiKey,
      path: {
        id: instance.path,
        location: instance.path_title,
      },
      profile: {
        id: instance.profile,
        name: instance.profile_title,
      },
      language: {
        id: 0,
        name: 'English',
      },
      enabled: instance.enabled,
    });
  }

  config.set('sonarr', sonarrs);
};

const transformRadarrConfig = (data: any): void => {
  const output = data as Array<ArrConfig>;
  const radarrs: any = [];

  for (const instance of output) {
    radarrs.push({
      uuid: instance.uuid,
      title: instance.title,
      protocol: instance.protocol,
      host: instance.hostname,
      port: instance.port,
      subpath: instance.urlBase,
      key: instance.apiKey,
      path: {
        id: instance.path,
        location: instance.path_title,
      },
      profile: {
        id: instance.profile,
        name: instance.profile_title,
      },
      language: {
        id: 0,
        name: 'English',
      },
      enabled: instance.enabled,
    });
  }

  config.set('radarr', radarrs);
};
