import bcrypt from 'bcryptjs';
import { Service } from 'diod';
import { nanoid } from 'nanoid';
import pino from 'pino';

import { PlexMediaServerApiClient } from '@/infrastructure/generated/custom/plex-api-client/plex-api-client';
import { PlexTvApiClient } from '@/infrastructure/generated/custom/plex-tv-api-client/plex-tv-api-client';
import { GetUserDetailsResponse } from '@/infrastructure/generated/custom/plex-tv-api-client/types';
import { Logger } from '@/infrastructure/logger/logger';
import { generateKeys } from '@/infrastructure/utils/security';
import { Worker } from '@/infrastructure/worker/worker';
import { MediaServerEntity } from '@/resources/media-server/entity';
import { MediaServerRepository } from '@/resources/media-server/repository';
import { MediaServerType } from '@/resources/media-server/types';
import { UserEntity } from '@/resources/user/entity';
import { UserRepository } from '@/resources/user/repository';
import { UserRole } from '@/resources/user/types';
import { SettingsService } from '@/services/settings/settings-service';
import {
  CreateAdminUserProps,
  CreateMediaServerProps,
  GetPlexUserProps,
  TestMediaServerProps,
} from '@/services/setup/types';

@Service()
/**
 * The `SetupService` class provides methods for setting up the server and performing various setup tasks.
 */
export class SetupService {
  private readonly logger: pino.Logger;

  /**
   * Creates an instance of the SetupService.
   * @param logger - The logger instance.
   * @param mediaServerRepo - The media server repository.
   * @param userRepo - The user repository.
   * @param settingsService - The settings service.
   * @param worker - The worker instance.
   */
  constructor(
    logger: Logger,
    private mediaServerRepo: MediaServerRepository,
    private userRepo: UserRepository,
    private settingsService: SettingsService,
    private worker: Worker,
  ) {
    this.logger = logger.child(
      { module: 'services.setup' },
      {
        redact: ['token', 'user.password'],
      },
    );
  }

  /**
   * Tests the connection to the media server.
   * @param props - The properties required to test the server connection.
   * @returns A boolean indicating whether the server connection test was successful.
   */
  async testServerConnection(props: TestMediaServerProps) {
    try {
      const client = new PlexMediaServerApiClient({
        BASE: `${props.protocol}://${props.host}:${props.port}`,
        HEADERS: {
          'X-Plex-Token': props.token,
        },
      });
      await client.server.getServerCapabilities();
      return true;
    } catch (err) {
      this.logger.debug(
        {
          server: {
            protocol: props.protocol,
            host: props.host,
            port: props.port,
            token: props.token,
          },
        },
        `Test Server failed`,
      );
      return false;
    }
  }

  /**
   * Creates an admin user with the provided properties.
   * @param props - The properties of the admin user.
   */
  async createAdminUser(props: CreateAdminUserProps) {
    const client = new PlexTvApiClient({
      HEADERS: {
        'X-Plex-Token': props.token,
      },
    });
    const data =
      (await client.plexTv.getUserDetails()) as GetUserDetailsResponse;

    await this.userRepo.findOrCreate(
      UserEntity.create({
        title: data.title ?? data.username,
        username: data.username,
        password: bcrypt.hashSync(props.password, 12),
        email: data.email,
        thumbnail: data.thumb,
        altId: '1',
        plexId: `${data.id}`,
        lastIp: props.ip,
        role: UserRole.ADMIN,
        owner: true,
      }),
    );
    this.logger.debug('Admin user created');
  }

  /**
   * Creates a new media server with the provided properties.
   * @param props - The properties for creating the media server.
   */
  async createMediaServer(props: CreateMediaServerProps) {
    await this.mediaServerRepo.findOneOrCreate(
      MediaServerEntity.create({
        name: 'default',
        type: MediaServerType.PLEX,
        url: `${props.protocol}://${props.host}:${props.port}`,
        token: props.token,
        metadata: {
          clientId: `petio_${nanoid()}`,
        },
        enabled: true,
      }),
    );
    this.logger.debug('Media server created');
  }

  /**
   * Updates the settings by generating new keys and updating the settings service.
   * @returns {Promise<void>} A promise that resolves when the settings are updated successfully.
   */
  async updateSettings(): Promise<void> {
    const keys = generateKeys(10);
    await this.settingsService.updateSettings({
      initialSetup: true,
      appKeys: keys,
    });
    this.logger.debug('Settings updated');
  }

  /**
   * Retrieves the details of a Plex user.
   * @param props - The properties required to fetch the Plex user details.
   * @returns An object containing the name and thumbnail of the Plex user, or null if the request fails.
   */
  async getPlexUser(props: GetPlexUserProps) {
    try {
      const client = new PlexTvApiClient({
        HEADERS: {
          'X-Plex-Token': props.token,
        },
      });
      const user =
        (await client.plexTv.getUserDetails()) as GetUserDetailsResponse;
      return { name: user.title, email: user.email };
    } catch (err) {
      this.logger.debug('Failed to get plex user', err);
      return null;
    }
  }

  /**
   * Restarts the workers to apply new configurations.
   *
   * @remarks
   * This method schedules a restart of the workers after a delay of 1000 milliseconds.
   * It logs a message indicating the restart and then calls the `restartWorkers` method
   * on the receiver object of the worker.
   */
  restartWorkers() {
    setTimeout(async () => {
      this.logger.info('restarting to apply new configurations');
      await this.worker.getReciever().restartWorkers();
    }, 1000);
  }
}
