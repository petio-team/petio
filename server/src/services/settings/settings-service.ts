import { Logger } from "@/infrastructure/logger/logger";
import { SettingsEntity } from "@/resources/settings/entity";
import { SettingsRepository } from "@/resources/settings/repository";
import { SettingsSchemaProps } from "@/resources/settings/schema";
import { SettingsProps } from "@/resources/settings/types";
import { SharedCache } from "@david.uhlir/shared-cache";
import { Service } from "diod";
import pino from "pino";

@Service()
export class SettingsService {
  private readonly logger: pino.Logger;

  /**
   * The cache key used for storing settings.
   */
  private readonly SETTINGS_CACHE_KEY = 'settings';

  /**
   * Represents a Settings service.
   */
  constructor(
    private readonly settingsRepository: SettingsRepository,
    logger: Logger,
  ) {
    this.logger = logger.child({ module: "services.settings" });
  }

  /**
   * Retrieves the settings from the cache if available, otherwise fetches them from the database.
   * If the settings are fetched from the database, they are also stored in the cache for future use.
   *
   * @returns A Promise that resolves to the retrieved settings.
   */
  async getSettings() {
    const inCache = await this.getSettingsFromCache();
    if (inCache) {
      return inCache;
    }
    const inDatabase = await this.settingsRepository.findOrCreate(
      SettingsEntity.create({}),
    );
    const props = inDatabase.getProps();
    await SharedCache.setData(this.SETTINGS_CACHE_KEY, props);
    return props;
  }

  /**
   * Updates the settings with the provided values.
   *
   * @param settings - The new settings to update.
   * @returns A boolean indicating whether the update was successful or not.
   */
  async updateSettings(settings: Partial<SettingsProps>) {
    this.logger.debug('Updating settings');
    try {
      const currentSettings = await this.getSettings();
      const { id, createdAt, updatedAt, ...props } = currentSettings;
      const newProps = { ...props, ...settings }
      await Promise.all([
        this.settingsRepository.updateMany({}, newProps),
        SharedCache.setData(this.SETTINGS_CACHE_KEY, newProps),
      ]);
      return true;
    } catch (error) {
      this.logger.debug(error, 'Failed to update settings');
      return false;
    }
  }

  /**
   * Retrieves the settings from the cache.
   *
   * @returns The settings entity if found in the cache, otherwise null.
   */
  private async getSettingsFromCache(): Promise<SettingsSchemaProps | null> {
    try {
      return await SharedCache.getData<SettingsSchemaProps>(this.SETTINGS_CACHE_KEY);
    } catch (error) {
      return null;
    }
  }
}
