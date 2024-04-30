import { mergeFiles } from "@/infra/config/file";
import { Logger } from "@/infra/logger/logger";
import { fileExists } from "@/utils/file";
import { Service } from "diod";
import fs from 'fs/promises';
import path from "path";
import { ArrConfig, EmailConfig, MainConfig } from "@/config/migration";
import { MediaServerRepository } from "@/resources/media-server/repository";
import { MediaServerEntity } from "@/resources/media-server/entity";
import { MediaServerType } from "@/resources/media-server/types";
import { NotificationRepository } from "@/resources/notification/repository";
import { NotificationType } from "@/resources/notification/types";
import { NotificationEntity } from "@/resources/notification/entity";
import { SettingsRepository } from "@/resources/settings/repository";
import { SettingsEntity } from "@/resources/settings/entity";
import { AuthType } from "@/resources/settings/types";
import { DownloaderRepository } from "@/resources/downloader/repository";
import { DownloaderEntity } from "@/resources/downloader/entity";
import { DownloaderType } from "@/resources/downloader/types";

@Service()
export class MigrationService {
  /**
   * Represents a Migration service.
   */
  constructor(
    private logger: Logger,
    private mediaServer: MediaServerRepository,
    private notification: NotificationRepository,
    private downloader: DownloaderRepository,
    private settings: SettingsRepository,
  ) {}

  /**
   * Migrates old files.
   *
   * @returns A promise that resolves to void.
   */
  async migrateOldFiles(): Promise<void> {
    const files = await mergeFiles();
    if (files.main || files.email || files.sonarrs || files.radarrs) {
      this.logger.info('Found old files to migrate');
      if (files.main) {
        await this.processMainConfig(files.main);
      }
      if (files.email) {
        await this.processEmailConfig(files.email);
      }
      if (files.sonarrs) {
        await Promise.all(files.sonarrs.map((config) => this.processArrConfigs(config, 'sonarr')));
      }
      if (files.radarrs) {
        await Promise.all(files.radarrs.map((config) => this.processArrConfigs(config, 'radarr')));
      }
    }
  }

  /**
   * Processes the array configurations and creates a downloader entity based on the provided configuration.
   * @param config - The array configuration object.
   * @param type - The type of downloader ('sonarr' or 'radarr').
   * @returns A promise that resolves when the downloader entity is created.
   */
  async processArrConfigs(config: ArrConfig, type: 'sonarr' | 'radarr') {
    await this.downloader.create(
      DownloaderEntity.create({
        name: config.title,
        type: type === 'radarr' ? DownloaderType.RADARR : DownloaderType.SONARR,
        url: config.hostname,
        token: config.apiKey,
        metadata: {
          profile: config.profile,
          path: config.path,
        },
        enabled: config.enabled,
      })
    );
  }

  /**
   * Processes the email configuration and creates a notification entity.
   * @param config - The email configuration object.
   * @returns A promise that resolves to void.
   */
  async processEmailConfig(config: EmailConfig): Promise<void> {
    await this.notification.create(
      NotificationEntity.create({
        name: 'email',
        url: `smtp://${config.emailUser}:${config.emailPass}@${config.emailServer}:${config.emailPort}`,
        type: NotificationType.EMAIL,
        metadata: {
          from: config.emailFrom,
          secure: config.emailSecure,
        },
        enabled: config.emailEnabled,
      })
    );
  }

  /**
   * Processes the main configuration.
   * @param config - The main configuration object.
   * @returns A promise that resolves when all the necessary operations are completed.
   */
  async processMainConfig(config: MainConfig) {
    if (process.pkg) {
      await this.createEnvFile(`
        DATABASE_URL=${config.DB_URL}
        HTTP_BASE_PATH=${config.base_path}
      `);
    }
    return Promise.all([
      this.notification.create(
        NotificationEntity.create({
          name: 'discord',
          url: config.discord_webhook,
          type: NotificationType.DISCORD,
          metadata: {},
          enabled: true,
        })
      ),
      this.notification.create(
        NotificationEntity.create({
          name: 'telegram',
          url: "https://telegram.org",
          type: NotificationType.TELEGRAM,
          metadata: {
            token: config.telegram_bot_token,
            chatId: config.telegram_bot_id,
            silent: config.telegram_send_silent,
          },
          enabled: true,
        })
      ),
      this.mediaServer.create(
        MediaServerEntity.create({
          name: 'default',
          type: MediaServerType.PLEX,
          url: `${config.plexProtocol}://${config.plexIp}:${config.plexPort}`,
          token: config.plexToken,
          enabled: true,
          metadata: {},
        })
      ),
      this.settings.create(
        SettingsEntity.create({
          authType: AuthType.STANDARD,
          initialCache: false,
          initialSetup: false,
          popularContent: config.plexPopular,
        })
      ),
    ]);
    // TODO: add admin user
  }

  async createEnvFile(content: string) {
    const envFile = path.join(process.cwd(), '.env');
    const hasEnvFile = await fileExists(envFile);
    if (hasEnvFile) {
      this.logger.info('Please add the following variables to your .env file:');
      this.logger.info(content);
    } else {
      this.logger.info('Creating .env file and adding variables');
      await fs.writeFile(envFile, content);
    }
  }
}
