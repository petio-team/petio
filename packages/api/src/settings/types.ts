import { z } from "zod";

export const ConfigSchema = z.object({
  discovery: z
    .object({
      popular: z.boolean().optional(),
    })
    .optional(),
  plex: z
    .object({
      ip: z.string().optional(),
      port: z.number().optional(),
      token: z.string().optional(),
      clientId: z.string().optional(),
      protocol: z.string().optional(),
    })
    .optional(),
  admin: z
    .object({
      id: z.number().optional(),
      username: z.string().optional(),
      email: z.string().email().optional(),
      password: z.string().optional(),
      thumbnail: z.string().optional(),
      displayName: z.string().optional(),
    })
    .optional(),
  notifications: z
    .object({
      discord: z
        .object({
          webhook: z.string().optional(),
          enabled: z.boolean().optional().default(true),
        })
        .optional(),
      telegram: z
        .object({
          token: z.string().optional(),
          chatId: z.string().optional(),
          silent: z.boolean().optional(),
          enabled: z.boolean().optional().default(true),
        })
        .optional(),
      email: z
        .object({
          address: z.string().optional(),
          username: z.string().optional(),
          password: z.string().optional(),
          port: z.number().optional(),
          secure: z.boolean().optional(),
          enabled: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
  instances: z
    .array(
      z.object({
        type: z.enum(["sonarr", "radarr"]),
        title: z.string().optional(),
        protocol: z.enum(["http", "https"]),
        hostname: z.string().optional(),
        port: z.number().optional(),
        apiKey: z.string().optional(),
        baseUrl: z.string().optional(),
        pathId: z.number().optional(),
        path: z.string().optional(),
        profileId: z.number().optional(),
        profile: z.string().optional(),
        uuid: z.string().optional(),
        active: z.boolean().optional(),
      })
    )
    .optional(),
});
export type Config = z.infer<typeof ConfigSchema>;

export const LegacyConfigSchema = z.object({
  DB_URL: z.string().optional(),
  tmdbApi: z.string().optional(),
  plexProtocol: z.string().optional(),
  plexIp: z.string().optional(),
  plexPort: z.string().optional(),
  plexToken: z.string().optional(),
  plexClientID: z.string().optional(),
  adminUsername: z.string().optional(),
  adminEmail: z.string().optional(),
  adminPass: z.string().optional(),
  adminId: z.string().optional(),
  adminThumb: z.string().optional(),
  adminDisplayName: z.string().optional(),
  fanartApi: z.string().optional(),
  base_path: z.string().optional(),
  plexPopular: z.boolean().optional(),
  discord_webhook: z.string().optional(),
  telegram_bot_token: z.string().optional(),
  telegram_chat_id: z.string().optional(),
  telegram_send_silently: z.boolean().optional(),
});
export type LegacyConfig = z.infer<typeof LegacyConfigSchema>;

export const LegacyEmailConfigSchema = z.object({
  emailEnabled: z.boolean().optional(),
  emailUser: z.string().optional(),
  emailPass: z.string().optional(),
  emailServer: z.string().optional(),
  emailPort: z.string().optional(),
  emailSecure: z.boolean().optional(),
});
export type LegacyEmailConfig = z.infer<typeof LegacyEmailConfigSchema>;

export const LegacyArrConfigSchema = z.object({
  title: z.string().optional(),
  hostname: z.string().optional(),
  protocol: z.string().optional(),
  apiKey: z.string().optional(),
  port: z.string().optional(),
  urlBase: z.string().optional(),
  path: z.string().optional(),
  path_title: z.string().optional(),
  profile: z.string().optional(),
  profile_title: z.string().optional(),
  uuid: z.string().optional(),
  active: z.boolean().optional(),
});
export type LegacyArrConfig = z.infer<typeof LegacyArrConfigSchema>;

export const LegacyConfigsSchema = z.object({
  sonarr: z.array(LegacyArrConfigSchema).optional(),
  radarr: z.array(LegacyArrConfigSchema).optional(),
  email: LegacyEmailConfigSchema.optional(),
  config: LegacyConfigSchema.optional(),
});
export type LegacyConfigs = z.infer<typeof LegacyConfigsSchema>;
