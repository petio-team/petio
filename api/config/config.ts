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
export const LoadLegacyConfigs = async (): Promise<T.LegacyConfigs> => {
  const source = process.cwd() + "/api/config";
  let legacyConfig: T.LegacyConfigs = {};

  let stat = await fs.stat(source + "/config.json");
  if (stat.isFile()) {
    const file = await fs.readFile(source + "/config.json", {
      encoding: "utf-8",
    });
    legacyConfig.config = T.LegacyConfigSchema.parse(JSON.parse(file));
  }

  stat = await fs.stat(source + "/email.json");
  if (stat.isFile()) {
    const file = await fs.readFile(source + "/email.json", {
      encoding: "utf-8",
    });
    legacyConfig.email = T.LegacyEmailConfigSchema.parse(JSON.parse(file));
  }

  stat = await fs.stat(source + "/radarr.json");
  if (stat.isFile()) {
    const file = await fs.readFile(source + "/radarr.json", {
      encoding: "utf-8",
    });
    legacyConfig.radarr = T.LegacyArrConfigSchema.parse(JSON.parse(file));
  }

  stat = await fs.stat(source + "/sonarr.json");
  if (stat.isFile()) {
    const file = await fs.readFile(source + "/sonarr.json", {
      encoding: "utf-8",
    });
    legacyConfig.sonarr = T.LegacyArrConfigSchema.parse(JSON.parse(file));
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
      username: lc.adminUsername,
      password: lc.adminPass,
      email: lc.adminEmail,
      displayName: lc.adminDisplayName,
      thumbnail: lc.adminThumb,
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
    if (configs.config === undefined) {
      return {};
    }
    const lec: T.LegacyEmailConfig = T.LegacyEmailConfigSchema.parse(
      configs.email
    );
    emailConfig.notifications = {
      email: {
        username: lec.emailUser,
        password: lec.emailPass,
        smtp: lec.emailServer,
        port: lec.emailPort?.length ? parseInt(lec.emailPort) : 25,
        secure: lec.emailSecure,
      },
    };

    return emailConfig;
  };

  const lSonarr = (): T.Config => {
    const sonarrConfig: T.Config = {};
    if (configs.config === undefined) {
      return {};
    }
    const lsc: T.LegacyArrConfig = T.LegacyArrConfigSchema.parse(
      configs.sonarr
    );
    sonarrConfig.instances = [
      {
        type: "sonarr",
        protocol: lsc.protocol === "https" ? "https" : "http",
        title: lsc.title,
        hostname: lsc.hostname,
        port: lsc.port?.length ? parseInt(lsc.port) : 8787,
        apiKey: lsc.apiKey,
        baseUrl: lsc.urlBase,
        pathId: lsc.path?.length ? parseInt(lsc.path) : 0,
        path: lsc.path_title,
        profileId: lsc.profile?.length ? parseInt(lsc.profile) : 0,
        profile: lsc.profile_title,
        uuid: lsc.uuid,
        active: lsc.active,
      },
    ];

    return sonarrConfig;
  };

  const lRadarr = (): T.Config => {
    const radarrConfig: T.Config = {};
    if (configs.config === undefined) {
      return {};
    }
    const lsc: T.LegacyArrConfig = T.LegacyArrConfigSchema.parse(
      configs.radarr
    );
    radarrConfig.instances = [
      {
        type: "radarr",
        protocol: lsc.protocol === "https" ? "https" : "http",
        title: lsc.title,
        hostname: lsc.hostname,
        port: lsc.port?.length ? parseInt(lsc.port) : 8787,
        apiKey: lsc.apiKey,
        baseUrl: lsc.urlBase,
        pathId: lsc.path?.length ? parseInt(lsc.path) : 0,
        path: lsc.path_title,
        profileId: lsc.profile?.length ? parseInt(lsc.profile) : 0,
        profile: lsc.profile_title,
        uuid: lsc.uuid,
        active: lsc.active,
      },
    ];

    return radarrConfig;
  };

  return { ...lConfig(), ...lEmail(), ...lSonarr(), ...lRadarr() };
};
