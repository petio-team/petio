import * as env from "env-var";

import XDGAppPaths from "xdg-app-paths";
import appPath from "app-root-path";
import { config } from "dotenv";
import path from "path";

const xdgAppPaths = XDGAppPaths({ name: "petio" });

config({
  path: path.join(appPath.toString(), ".env"),
});

export default {
  APP_DIR: appPath.toString(),
  HOST: env.get("HOST").default("localhost").asString(),
  PORT: env.get("PORT").default(7777).asPortNumber(),
  BASE_PATH: env.get("BASE_PATH").default("/").asString(),
  LOG_LEVEL: env
    .get("LOG_LEVEL")
    .default("info")
    .asEnum(["info", "warning", "error", "debug"]),
  IS_PROD: env.get("NODE_ENV").asString() === "production",
  MONGODB_URL: env
    .get("MONGODB_URL")
    .default("mongodb://localhost:27017/petio")
    .asString(),
  CONFIG_DIR: env.get("CONFIG_DIR").default(xdgAppPaths.config()).asString(),
    .asString(),
  TRUSTED_PROXIES: env.get("TRUSTED_PROXIES").default("").asString().split(","),
  TMDB_API_KEY: env.get("TMDB_API_KEY").default("1af5ad19a2d972a67cd27eb033979c4c").asString(),
  FANART_API_KEY: env.get("FANART_API_KEY").default("ee409f6fb0c5cd2352e7a454d3f580d4").asString(),
};
