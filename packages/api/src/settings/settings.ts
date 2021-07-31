import * as T from "./types";

import { access, readFile, stat, writeFile } from "fs/promises";

import { constants } from 'fs';
import locals from "../app/locals";
import path from "path";
import yaml from "yaml";

/**
 * configName stores the name of our config file
 */
const settingsName = "petio.yaml";

/**
 * GetSettingsPath gets a path to the settings file
 *
 * @returns a full path to the settings file
 */
export const GetSettingsPath = (): string => {
  return path.join(locals.CONFIG_DIR, settingsName);
};

export const LoadSettings = async (): Promise<T.Config> => {
  const legacyConfigDir = path.join(locals.APP_DIR, "./packages/api/config");
  const legacyConfigs = await LoadLegacyConfigFiles(legacyConfigDir);
  let settings: T.Config = {};
  if (Object.keys(legacyConfigs).length) {
    settings = UpgradeLegacyConfigs(legacyConfigs);
  }

  if (!Object.keys(settings).length) {
    settings = await LoadSettingsFile(GetSettingsPath());
  }

  return settings;
};

/**
 * LoadSettingsFile attempts to load a settings file
 *
 * @param settingsPath the path of which the setting file is located
 * @returns a new instance of a config
 */
export const LoadSettingsFile = async (
  settingsPath: string
): Promise<T.Config> => {
  const exists = await IsResourceAvailable(settingsPath);
  if (!exists) {
    return {};
  }

  const file = await readFile(settingsPath, "utf-8");
  const raw = yaml.parse(file.toString());

  return T.ConfigSchema.parse(raw);
};

/**
 * LoadLegacyConfigFiles loads all legacy config files
 *
 * @returns an object of legacy config files
 */
export const LoadLegacyConfigFiles = async (
  legacyConfigPath: string
): Promise<T.LegacyConfigs> => {
  const legacyConfig: T.LegacyConfigs = {};
  let source = "";

  source = path.join(legacyConfigPath, "config.json");
  let exists = await IsResourceAvailable(source);
  if (exists) {
    const file = await readFile(source, {
      encoding: "utf-8",
    });
    legacyConfig.config = T.LegacyConfigSchema.parse(JSON.parse(file));
  }

  source = path.join(legacyConfigPath, "email.json");
  exists = await IsResourceAvailable(source);
  if (exists) {
    const file = await readFile(source, {
      encoding: "utf-8",
    });
    legacyConfig.email = T.LegacyEmailConfigSchema.parse(JSON.parse(file));
  }

  source = path.join(legacyConfigPath, "radarr.json");
  exists = await IsResourceAvailable(source);
  if (exists) {
    const file = await readFile(source, {
      encoding: "utf-8",
    });
    const instances = T.LegacyArrConfigSchema.array().parse(JSON.parse(file));
    legacyConfig.radarr = [...(legacyConfig.radarr ?? []), ...instances];
  }

  source = path.join(legacyConfigPath, "sonarr.json");
  exists = await IsResourceAvailable(source);
  if (exists) {
    const file = await readFile(source, {
      encoding: "utf-8",
    });
    const instances = T.LegacyArrConfigSchema.array().parse(JSON.parse(file));
    legacyConfig.sonarr = [...(legacyConfig.sonarr ?? []), ...instances];
  }

  return legacyConfig;
};

/**
 * UpgradeLegacyConfigs takes old legacy configs and merge them into
 * a new config schema
 *
 * @param configs is an object containing contents of config files
 * @returns a new config schema
 */
export const UpgradeLegacyConfigs = (configs: T.LegacyConfigs): T.Config => {
  const lConfig = (): T.Config => {
    const mainConfig: T.Config = {};
    if (configs.config === undefined) {
      return {};
    }
    const lc: T.LegacyConfig = configs.config;
    mainConfig.general = { basePath: lc.base_path };
    mainConfig.discovery = { popular: lc.plexPopular };
    mainConfig.thirdpartyapis = { tmdb: lc.tmdbApi, fanart: lc.fanartApi };
    mainConfig.plex = {
      ip: lc.plexIp,
      port: lc.plexPort ? parseInt(lc.plexPort) : 32400,
      token: lc.plexToken,
      clientId: lc.plexClientID,
      protocol: lc.plexProtocol,
    };
    mainConfig.admin = {
      id: lc.adminId?.length ? parseInt(lc.adminId) : 0,
      username: lc.adminUsername,
      password: lc.adminPass,
      email: lc.adminEmail,
      displayName: lc.adminDisplayName,
      thumbnail: lc.adminThumb,
    };
    mainConfig.db = {
      url: lc.DB_URL,
    };
    mainConfig.notifications = {
      discord: {
        webhook: lc.discord_webhook,
        enabled: lc.discord_webhook ? true : false,
      },
      telegram: {
        chatId: lc.telegram_chat_id,
        token: lc.telegram_bot_token,
        silent: lc.telegram_send_silently,
        enabled: lc.telegram_bot_token ? true : false,
      },
    };

    return mainConfig;
  };

  const lEmail = (): T.Config => {
    const emailConfig: T.Config = {};
    if (configs.email === undefined) {
      return {};
    }
    const lec: T.LegacyEmailConfig = configs.email;
    emailConfig.notifications = {
      email: {
        address: lec.emailServer,
        username: lec.emailUser,
        password: lec.emailPass,
        port: lec.emailPort?.length ? parseInt(lec.emailPort) : 25,
        secure: lec.emailSecure,
        enabled: lec.emailEnabled,
      },
    };

    return emailConfig;
  };

  const lSonarr = (): T.Config => {
    const sonarrConfig: T.Config = {};
    if (configs.sonarr === undefined) {
      return {};
    }
    const lsc: T.LegacyArrConfig[] = configs.sonarr;
    sonarrConfig.instances = [
      {
        type: "sonarr",
        protocol: lsc[0].protocol === "https" ? "https" : "http",
        title: lsc[0].title,
        hostname: lsc[0].hostname,
        port: lsc[0].port?.length ? parseInt(lsc[0].port) : 8787,
        apiKey: lsc[0].apiKey,
        baseUrl: lsc[0].urlBase,
        pathId: lsc[0].path?.length ? parseInt(lsc[0].path) : 0,
        path: lsc[0].path_title,
        profileId: lsc[0].profile?.length ? parseInt(lsc[0].profile) : 0,
        profile: lsc[0].profile_title,
        uuid: lsc[0].uuid,
        active: lsc[0].active,
      },
    ];

    return sonarrConfig;
  };

  const lRadarr = (): T.Config => {
    const radarrConfig: T.Config = {};
    if (configs.radarr === undefined) {
      return {};
    }
    const lsc: T.LegacyArrConfig[] = configs.radarr;
    radarrConfig.instances = [
      {
        type: "radarr",
        protocol: lsc[0].protocol === "https" ? "https" : "http",
        title: lsc[0].title,
        hostname: lsc[0].hostname,
        port: lsc[0].port?.length ? parseInt(lsc[0].port) : 8787,
        apiKey: lsc[0].apiKey,
        baseUrl: lsc[0].urlBase,
        pathId: lsc[0].path?.length ? parseInt(lsc[0].path) : 0,
        path: lsc[0].path_title,
        profileId: lsc[0].profile?.length ? parseInt(lsc[0].profile) : 0,
        profile: lsc[0].profile_title,
        uuid: lsc[0].uuid,
        active: lsc[0].active,
      },
    ];

    return radarrConfig;
  };

  return {
    ...lConfig(),
    notifications: { ...lConfig().notifications, ...lEmail().notifications },
    instances: [...(lSonarr().instances ?? []), ...(lRadarr().instances ?? [])],
  };
};

/**
 * WriteConfig attempts to write the config to the filesystem
 */
export const WriteConfig = async (
  configPath: string,
  data: T.Config
): Promise<void> => {
  await writeFile(configPath, yaml.stringify(data));
};

export const IsResourceAvailable = async (resourcePath: string): Promise<boolean> => {
  try {
    await stat(resourcePath);
    return true;
  }
  catch (err) {
    console.log(err);
    return false;
  }
 };
