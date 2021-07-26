import fs from "fs/promises";
import path from "path";
import xdg from "xdg-app-paths";
import yaml from "yaml";
import * as T from "./types";

// configName provides the name of the main config file
const configName = "petio.yaml";

/**
 * GetConfigPath gets a path to the config file
 *
 * @returns a full path to the config file
 */
export const GetConfigPath = (): string => {
  return path.join(xdg.config(), "petio", configName);
};

/**
 * LoadConfig attempts to load a config file
 *
 * @param configPath the path of which the config is located
 * @returns a new instance of a config
 */
export const LoadConfig = async (
  configPath: string
): Promise<T.Config | undefined> => {
  const stat = await fs.stat(configPath);
  if (!stat.isFile()) {
    return;
  }

  const file = await fs.readFile(configPath, "utf-8");
  const raw = yaml.parse(file.toString());

  return T.ConfigSchema.parse(raw);
};

/**
 * Loads all legacy config files
 *
 * @returns an object of legacy config files
 */
export const LoadLegacyConfigs = async (
  legacyConfigPath: string
): Promise<T.LegacyConfigs> => {
  const legacyConfig: T.LegacyConfigs = {};
  let source = "";

  source = path.join(legacyConfigPath, "config.json");
  let stat = await fs.stat(source);
  if (stat.isFile()) {
    const file = await fs.readFile(source, {
      encoding: "utf-8",
    });
    legacyConfig.config = T.LegacyConfigSchema.parse(JSON.parse(file));
  }

  source = path.join(legacyConfigPath, "email.json");
  stat = await fs.stat(source);
  if (stat.isFile()) {
    const file = await fs.readFile(source, {
      encoding: "utf-8",
    });
    legacyConfig.email = T.LegacyEmailConfigSchema.parse(JSON.parse(file));
  }

  source = path.join(legacyConfigPath, "radarr.json");
  stat = await fs.stat(source);
  if (stat.isFile()) {
    const file = await fs.readFile(source, {
      encoding: "utf-8",
    });
    const instances = T.LegacyArrConfigSchema.array().parse(JSON.parse(file));
    legacyConfig.radarr = [...(legacyConfig.radarr ?? []), ...instances];
  }

  source = path.join(legacyConfigPath, "sonarr.json");
  stat = await fs.stat(source);
  if (stat.isFile()) {
    const file = await fs.readFile(source, {
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
