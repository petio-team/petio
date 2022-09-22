import { container } from "tsyringe";
import { Logger } from "winston";
import ISettingsRepository from "@/models/settings/repository";
import trending from "@/services/tmdb/trending";

export default async () => {
  const logger = container.resolve<Logger>("Logger");
  const repo = await container.resolve<ISettingsRepository>("Settings");
  const settings = await repo.Get();
  if (settings.initialCache) {
    return;
  }

  logger.info("Running first time cache, this may take a few minutes");

  // cache trending
  await trending();

  // update initial cache
  await repo.Upsert({ ...settings, initialCache: true });
  logger.info("Finished updating cache");
};

