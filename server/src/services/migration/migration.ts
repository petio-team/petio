import { Service } from 'diod';
import fs from 'fs/promises';
import { join } from 'path';

import { tryLoadEnv } from '@/infrastructure/config/dotenv';
import { NODE_ENV } from '@/infrastructure/config/env';
import { getFromContainer } from '@/infrastructure/container/container';
import { MongooseDatabaseConnection } from '@/infrastructure/database/connection';
import { Logger } from '@/infrastructure/logger/logger';
import { fileExists } from '@/infrastructure/utils/file';
import { DownloaderEntity } from '@/resources/downloader/entity';
import { DownloaderRepository } from '@/resources/downloader/repository';
import { DownloaderType } from '@/resources/downloader/types';
import { MediaServerEntity } from '@/resources/media-server/entity';
import { MediaServerRepository } from '@/resources/media-server/repository';
import { MediaServerType } from '@/resources/media-server/types';
import { NotificationEntity } from '@/resources/notification/entity';
import { NotificationRepository } from '@/resources/notification/repository';
import { NotificationType } from '@/resources/notification/types';
import { SettingsEntity } from '@/resources/settings/entity';
import { SettingsRepository } from '@/resources/settings/repository';
import { AuthType } from '@/resources/settings/types';
import { UserEntity } from '@/resources/user/entity';
import { UserRepository } from '@/resources/user/repository';
import { UserRole } from '@/resources/user/types';
import {
  ArrConfig,
  EmailConfig,
  MainConfig,
  backupOldFiles,
  mergeFiles,
} from '@/services/migration/file';

@Service()
export class MigrationService {
  /**
   * Represents a Migration service.
   */
  constructor(
    private logger: Logger,
    private connection: MongooseDatabaseConnection,
  ) {}

  /**
   * Migrates old files.
   *
   * @returns A promise that resolves to void.
   */
  async migrateOldFiles(): Promise<void> {
    const files = await mergeFiles();
    this.logger.debug(`config data found`, files);
    if (files.main) {
      this.logger.info('Found old files to migrate');
      try {
        this.logger.debug(`parsing main config file`);
        await this.processMainConfig(files.main);
        if (files.email || files.sonarr || files.radarr) {
          if (!this.connection.has('default')) {
            this.logger.error(
              'No valid database connection present, unable to migrate files, exiting process',
            );
            process.exit(1);
          }
          if (files.email) {
            this.logger.debug(`parsing email config file`);
            await this.processEmailConfig(files.email);
          }
          if (files.sonarr) {
            this.logger.debug(`parsing sonarr config file`);
            await Promise.all(
              files.sonarr.map((config) =>
                this.processArrConfigs(config, 'sonarr'),
              ),
            );
          }
          if (files.radarr) {
            this.logger.debug(`parsing radarr config file`);
            await Promise.all(
              files.radarr.map((config) =>
                this.processArrConfigs(config, 'radarr'),
              ),
            );
          }
        }
      } catch (err) {
        this.logger.error('Failed to migrate old files', err);
      }
    } else {
      this.logger.info(
        'You must have a config.json file in order to migrate old files',
      );
    }
  }

  /**
   * Processes the array configurations and creates a downloader entity based on the provided configuration.
   * @param config - The array configuration object.
   * @param type - The type of downloader ('sonarr' or 'radarr').
   * @returns A promise that resolves when the downloader entity is created.
   */
  private async processArrConfigs(
    config: ArrConfig,
    type: 'sonarr' | 'radarr',
  ) {
    const downloader = getFromContainer(DownloaderRepository);
    await downloader.findOrCreate(
      DownloaderEntity.create({
        name: config.title,
        type: type === 'radarr' ? DownloaderType.RADARR : DownloaderType.SONARR,
        url: `${config.protocol}://${config.hostname}:${config.port}${
          config.urlBase !== '' ? config.urlBase : ''
        }`,
        token: config.apiKey,
        metadata: {
          profile: config.profile,
          path: config.path,
        },
        enabled: config.active,
      }),
    );
  }

  /**
   * Processes the email configuration and creates a notification entity.
   * @param config - The email configuration object.
   * @returns A promise that resolves to void.
   */
  private async processEmailConfig(config: EmailConfig): Promise<void> {
    if (
      config.emailServer !== '' &&
      config.emailUser !== '' &&
      config.emailPass !== ''
    ) {
      const notification = getFromContainer(NotificationRepository);
      await notification.findOneOrCreate(
        NotificationEntity.create({
          name: 'email',
          type: NotificationType.SMTP,
          metadata: {
            host: config.emailServer,
            port: config.emailPort,
            username: config.emailUser,
            password: config.emailPass,
            from: config.emailFrom,
            secure: config.emailSecure,
          },
          enabled: config.emailEnabled,
        }),
      );
    }
  }

  /**
   * Tries to establish a connection to the database using the provided URL.
   *
   * @param url - The URL of the database to connect to.
   * @returns A promise that resolves to a boolean indicating whether the connection was successful.
   */
  private async tryDatabaseConnection(url: string): Promise<boolean> {
    try {
      await this.connection.connect('default', url, {}, true);
      return true;
    } catch (error) {
      this.logger.error('Failed to connect to the database for migration url', {
        url,
      });
      return false;
    }
  }

  /**
   * Processes the main configuration.
   * @param config - The main configuration object.
   * @returns A promise that resolves when all the necessary operations are completed.
   */
  private async processMainConfig(config: MainConfig) {
    const tryConnection = await this.tryDatabaseConnection(config.DB_URL);
    if (!tryConnection) {
      this.logger.error('Failed to connect to the database, exiting process');
      process.exit(1);
    }
    if (process.pkg) {
      if (NODE_ENV === 'production') {
        await this.createEnvFile(
          `DATABASE_URL=${config.DB_URL}\nHTTP_BASE_PATH=${config.base_path}`,
        );
        tryLoadEnv();
      } else if (NODE_ENV === 'docker') {
        this.logger.warn(
          `\nYou are using docker, so an env file can not be generated for you.
Instead you can paste the contents of the file into your docker compose environments section:\n
DATABASE_URL=mongo://mongo:27017\nHTTP_BASE_PATH=/\n`,
        );
      }
    }
    const notification = getFromContainer(NotificationRepository);
    const mediaServer = getFromContainer(MediaServerRepository);
    const settings = getFromContainer(SettingsRepository);
    const user = getFromContainer(UserRepository);
    const extractedDiscordWebhook =
      config.discord_webhook && config.discord_webhook !== ''
        ? this.extractDiscordIdAndToken(config.discord_webhook)
        : null;

    await Promise.all([
      extractedDiscordWebhook
        ? notification.findOneOrCreate(
            NotificationEntity.create({
              name: 'discord',
              type: NotificationType.DISCORD,
              metadata: {
                id: extractedDiscordWebhook.id,
                token: extractedDiscordWebhook.token,
              },
              enabled: true,
            }),
          )
        : undefined,
      config.telegram_bot_token && config.telegram_bot_token !== ''
        ? notification.findOneOrCreate(
            NotificationEntity.create({
              name: 'telegram',
              type: NotificationType.TELEGRAM,
              metadata: {
                token: config.telegram_bot_token,
                chatId: config.telegram_bot_id,
                silent: config.telegram_send_silent,
              },
              enabled: true,
            }),
          )
        : undefined,
      mediaServer.findOneOrCreate(
        MediaServerEntity.create({
          name: 'default',
          type: MediaServerType.PLEX,
          url: `${config.plexProtocol}://${config.plexIp}:${config.plexPort}${
            config.base_path !== '' ? config.base_path : ''
          }`,
          token: config.plexToken,
          enabled: true,
          metadata: {},
        }),
      ),
      settings.findOrCreate(
        SettingsEntity.create({
          authType: AuthType.STANDARD,
          initialCache: false,
          initialSetup: true,
          popularContent: config.plexPopular,
        }),
      ),
      // ? In future maybe we re-pull this from plex
      user.findOrCreate(
        UserEntity.create({
          title: config.adminDisplayName,
          username: config.adminUsername,
          password: config.adminPass,
          thumbnail: config.adminThumb,
          email: config.adminEmail,
          role: UserRole.ADMIN,
          owner: true,
        }),
      ),
    ]);
    // backup files
    await backupOldFiles();
  }

  extractDiscordIdAndToken(webhookUrl: string) {
    const matches = webhookUrl.match(/discord.com\/api\/webhooks\/(\d+)\/(.+)/);
    if (!matches) {
      return null;
    }
    return {
      id: matches[1],
      token: matches[2],
    };
  }

  /**
   * Creates or updates the .env file with the provided content.
   * If the .env file already exists, it logs the content to be added to the file.
   * If the .env file does not exist, it creates the file and adds the content.
   * @param content - The content to be added to the .env file.
   */
  async createEnvFile(content: string) {
    const envFile = join(process.cwd(), '.env');
    const hasEnvFile = await fileExists(envFile);
    if (hasEnvFile) {
      this.logger.info(
        `Copy and paste the below into your env file (.env):\n${content}`,
      );
    } else {
      this.logger.info('Creating .env file and adding variables');
      await fs.writeFile(envFile, content);
    }
  }
}
