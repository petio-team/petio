import logger from "@/loaders/logger";
import pkg from "@/../package.json";
import { conf, hasConfig } from "@/app/config";

export default () => {
  logger.info(`Petio v${pkg.version} [${conf.get("logger.level")}]`);
  logger.info(
    `Listening on http://${conf.get("petio.host")}:${conf.get("petio.port")}`
  );
  if (!hasConfig()) {
    logger.warn(
      "Initial setup is required, please proceed to the webui to begin the setup"
    );
  }
};
