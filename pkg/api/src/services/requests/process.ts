import { getFromContainer } from '@/infra/container/container';
import loggerMain from '@/infra/logger/logger';
import { ArchiveEntity } from '@/resources/archive/entity';
import { ArchiveRepository } from '@/resources/archive/repository';
import { DownloaderRepository } from '@/resources/downloader/repository';
import { DownloaderType } from '@/resources/downloader/types';
import { ProfileEntity } from '@/resources/profile/entity';
import { ProfileRepository } from '@/resources/profile/repository';
import { RequestEntity } from '@/resources/request/entity';
import { RequestRepository } from '@/resources/request/repository';
import { RequestType } from '@/resources/request/types';
import { UserEntity } from '@/resources/user/entity';
import { UserRepository } from '@/resources/user/repository';
import { UserRole } from '@/resources/user/types';
import Radarr from '@/services/downloaders/radarr';
import Sonarr from '@/services/downloaders/sonarr';
import Mailer from '@/services/mail/mailer';
import Discord from '@/services/notifications/discord';
import Telegram from '@/services/notifications/telegram';
import filter from '@/services/requests/filter';
import { showLookup } from '@/services/tmdb/show';

const logger = loggerMain.child({ module: 'requests.process' });

export default class ProcessRequest {
  request: any;

  user?: UserEntity;

  constructor(req = {}, usr?: UserEntity) {
    this.request = req;
    this.user = usr;
  }

  async new() {
    if (!this.user) {
      throw new Error('user required');
    }

    let out: any = {};
    const quotaPass = await this.checkQuota();
    if (quotaPass) {
      try {
        const existing = await getFromContainer(RequestRepository).findOne({
          requestId: this.request.id,
        });
        if (existing) {
          out = await this.existing();
        } else {
          out = await this.create();
        }
        if (quotaPass !== 'admin') {
          const updatedUser = await getFromContainer(UserRepository)
            .model()
            .findOneAndUpdate(
              { id: this.user.id },
              { $inc: { quotaCount: 1 } },
              { new: true, useFindAndModify: false },
            )
            .exec();
          if (!updatedUser) {
            throw new Error('no user found');
          }
          out.quota = updatedUser.quotaCount;
        }
        this.mailRequest();
        this.discordNotify();
      } catch (err) {
        logger.error('REQ: Error', err);
        out = {
          message: 'failed',
          error: true,
          user: this.user,
          request: this.request,
        };
      }
    } else {
      out = {
        message: `You are over your quota. Quotas reset each week.`,
        error: true,
        user: this.user,
        request: this.request,
      };
    }
    return out;
  }

  async existing(): Promise<
    { message: string; user: string; request: any } | undefined
  > {
    if (!this.user) {
      throw new Error('user required');
    }
    let autoApprove = false;
    let autoApproveTv = false;
    let profile: ProfileEntity | null = null;
    if (this.user.profileId) {
      const profileResult = await getFromContainer(ProfileRepository).findOne({
        id: this.user.profileId,
      });
      if (profileResult.isSome()) {
        profile = profileResult.unwrap();
        autoApprove = profile.autoApprove ?? false;
        autoApproveTv = profile.autoApproveTv ?? false;
      }
    }
    if (this.user.role === 'admin') {
      autoApprove = true;
      autoApproveTv = true;
    }
    const requestResult = await getFromContainer(RequestRepository).findOne({
      requestId: this.request.id,
    });
    if (requestResult.isNone()) {
      return undefined;
    }
    const requestDb = requestResult.unwrap().getProps();

    if (!requestDb.users.includes(this.user.id)) {
      requestDb.users.push(this.user.id);
    }
    if (this.request.type === 'tv') {
      const existingSeasons = requestDb.seasons || {};
      // eslint-disable-next-line no-restricted-syntax
      for (const [k] of this.request.seasons) {
        existingSeasons[k] = true;
      }
      requestDb.seasons = existingSeasons;
      this.request.seasons = existingSeasons;
    }
    if (
      (this.request.type === 'movie' && autoApprove) ||
      (this.request.type === 'tv' && autoApproveTv)
    ) {
      requestDb.approved = true;
    }
    await getFromContainer(RequestRepository).updateMany(
      { requestId: this.request.id },
      requestDb,
    );
    await this.sendToDvr(profile);

    return {
      message: 'request updated',
      user: this.user.title,
      request: this.request,
    };
  }

  async create() {
    if (!this.user) {
      throw new Error('user required');
    }
    let autoApprove = false;
    let profile: ProfileEntity | null = null;
    if (this.user.profileId) {
      const profileResult = await getFromContainer(ProfileRepository).findOne({
        id: this.user.profileId,
      });
      if (profileResult.isSome()) {
        profile = profileResult.unwrap();
        autoApprove =
          this.request.type === 'movie'
            ? profile.autoApprove
            : profile.autoApproveTv;
      }
    }
    if (this.user.role === UserRole.ADMIN) {
      autoApprove = true;
    }

    if (this.request.type === 'tv' && !this.request.tvdb_id) {
      const lookup = await showLookup(this.request.id, true);
      this.request.tvdb_id = lookup.tvdb_id;
    }

    const newRequest = new RequestEntity({
      id: this.request.id,
      props: {
        type:
          this.request.type === 'movie' ? RequestType.MOVIE : RequestType.TV,
        status: 1,
        title: this.request.title,
        thumbnail: this.request.thumb,
        users: [this.user.id],
        imdbId: this.request.imdb_id,
        tmdbId: this.request.tmdb_id,
        tvdbId: this.request.tvdb_id,
        seasons: this.request.type === 'tv' ? this.request.seasons : {},
        pending: {},
        sonarrs: [],
        radarrs: [],
        approved: autoApprove,
        timestamp: new Date(),
      },
    });

    try {
      const { id, ...newRequestProps } = newRequest.getProps();
      await getFromContainer(RequestRepository).updateMany(
        { requestId: id },
        newRequestProps,
      );
      if (autoApprove) {
        this.sendToDvr(profile);
      } else {
        logger.info('REQ: Request requires approval, waiting');
        this.pendingDefaults(profile);
      }
    } catch (err) {
      logger.error(`REQ: Unable to save request`, err);
      return {
        message: 'failed',
        error: true,
        user: this.user,
        request: this.request,
      };
    }

    return {
      message: 'request added',
      user: this.user.title,
      request: this.request,
    };
  }

  async pendingDefaults(profile) {
    const pending: any = {};
    const filterMatch: any = await filter(this.request);
    if (filterMatch) {
      logger.info(
        'REQ: Pending Request Matched on custom filter, setting default',
      );
      // eslint-disable-next-line no-restricted-syntax
      for (const [k] of filterMatch) {
        const matchedFilter = filterMatch[k];
        pending[matchedFilter.server] = {
          path: matchedFilter.path,
          profile: matchedFilter.profile,
          tag: matchedFilter.tag,
        };
      }
    } else if (this.request.type === 'movie') {
      const instances = await getFromContainer(DownloaderRepository).findAll({
        type: DownloaderType.RADARR,
      });
      // eslint-disable-next-line no-restricted-syntax
      for (const instance of instances) {
        if (!instance.id) {
          return;
        }
        if (profile.radarr && profile.radarr[instance.id]) {
          pending[instance.id] = {
            path: instance.metadata.path,
            profile: instance.metadata.profile,
            tag: false,
          };
        }
      }
    } else {
      const instances = await getFromContainer(DownloaderRepository).findAll({
        type: DownloaderType.SONARR,
      });
      // eslint-disable-next-line no-restricted-syntax
      for (const instance of instances) {
        if (!instance.id) {
          return;
        }
        if (profile.sonarr && profile.sonarr[instance.id]) {
          pending[instance.id] = {
            path: instance.metadata.path,
            profile: instance.metadata.profile,
            tag: false,
          };
        }
      }
    }
    if (Object.keys(pending).length > 0) {
      await getFromContainer(RequestRepository).updateMany(
        { requestId: this.request.id },
        { $set: { pendingDefault: pending } },
      );

      logger.debug('REQ: Pending Defaults set for later');
    } else {
      logger.debug('REQ: No Pending Defaults to Set');
    }
  }

  async sendToDvr(profile) {
    const instances = await getFromContainer(DownloaderRepository).findAll();
    let filterMatch: any = await filter(this.request);
    if (filterMatch) {
      if (!Array.isArray(filterMatch)) filterMatch = [filterMatch];
      logger.info('REQ: Matched on custom filter, sending to specified server');
      logger.debug('REQ: Sending to DVR');
      if (this.request.type === 'movie') {
        // eslint-disable-next-line no-restricted-syntax
        for (const match of filterMatch) {
          const instance = instances.find((i) => i.id === match.server);
          if (!instance) {
            return;
          }

          new Radarr(instance).manualAdd(this.request, match);
        }
      } else {
        // eslint-disable-next-line no-restricted-syntax
        for (const match of filterMatch) {
          const instance = instances.find((i) => i.id === match.server);
          if (!instance) {
            return;
          }

          new Sonarr(instance).addShow({ id: match.server }, this.request);
        }
      }
      return;
    }
    logger.debug('REQ: Sending to DVR');
    // If profile is set use arrs from profile
    if (profile) {
      if (profile.radarr && this.request.type === 'movie') {
        // eslint-disable-next-line no-restricted-syntax
        for (const [k] of profile.radarr) {
          const active = profile.radarr[k];
          if (active) {
            const instance = instances.find((i) => i.id === k);
            if (!instance) {
              return;
            }
            new Radarr(instance).processRequest(this.request.id);
          }
        }
      }
      if (profile.sonarr && this.request.type === 'tv') {
        // eslint-disable-next-line no-restricted-syntax
        for (const [k] of profile.sonarr) {
          const active = profile.sonarr[k];
          if (active) {
            const instance = instances.find((i) => i.id === k);
            if (!instance) {
              return;
            }
            new Sonarr(instance).addShow({ id: k }, this.request);
          }
        }
      }
    } else {
      // No profile set send to all arrs
      logger.debug('REQ: No profile for DVR');
      if (this.request.type === 'tv') {
        const sonarrs = instances.filter(
          (i) => i.type === DownloaderType.SONARR,
        );
        // eslint-disable-next-line no-restricted-syntax
        for (const instance of sonarrs) {
          new Sonarr(instance).addShow(false, this.request);
        }
      }
      if (this.request.type === 'movie') {
        const radarrs = instances.filter(
          (i) => i.type === DownloaderType.RADARR,
        );
        // eslint-disable-next-line no-restricted-syntax
        for (const instance of radarrs) {
          new Radarr(instance).processRequest(this.request.id);
        }
      }
    }
  }

  async removeFromDVR() {
    if (this.request) {
      const instances = await getFromContainer(DownloaderRepository).findAll();
      if (this.request.radarrId.length > 0 && this.request.type === 'movie') {
        for (let i = 0; i < Object.keys(this.request.radarrId).length; i += 1) {
          const radarrIds = this.request.radarrId[i];
          const rId = radarrIds[Object.keys(radarrIds)[0]];
          const serverUuid = Object.keys(radarrIds)[0];

          const instance = instances.find((j) => j.id === serverUuid);
          if (!instance) {
            return;
          }

          const server = new Radarr(instance);
          try {
            await server.getClient().movie.deleteApiV3MovieById({
              id: rId,
            });
            logger.info(
              `REQ: ${this.request.title} removed from Radarr server - ${serverUuid}`,
            );
          } catch (err) {
            logger.error(`REQ: Error unable to remove from Radarr`, err);
          }
        }
      }
      if (this.request.sonarrId.length > 0 && this.request.type === 'tv') {
        for (let i = 0; i < Object.keys(this.request.sonarrId).length; i += 1) {
          const sonarrIds = this.request.sonarrId[i];
          const sId = sonarrIds[Object.keys(sonarrIds)[0]];
          const serverUuid = Object.keys(sonarrIds)[0];

          const instance = instances.find((s) => s.id === serverUuid);
          if (!instance) {
            continue;
          }

          try {
            await new Sonarr(instance).remove(sId);
            logger.info(
              `REQ: ${this.request.title} removed from Sonarr server - ${serverUuid}`,
            );
          } catch (err) {
            logger.error(`REQ: Error unable to remove from Sonarr`, err);
          }
        }
      }
    }
  }

  discordNotify() {
    if (!this.user) {
      throw new Error('user required');
    }

    const userData = this.user;
    const requestData = this.request;
    const requestType = requestData.type === 'tv' ? 'TV Show' : 'Movie';
    const title: any = 'New Request';
    const subtitle: any = `A new request has been added for the ${requestType} "${requestData.title}"`;
    const image: any = `https://image.tmdb.org/t/p/w500${requestData.thumb}`;
    [new Discord(), new Telegram()].forEach((notification) =>
      notification.send(title, subtitle, userData.title as any, image),
    );
  }

  async mailRequest() {
    const userData: any = this.user;
    if (!userData.email) {
      logger.warn('MAILER: No user email');
      return;
    }
    const requestData: any = this.request;
    const email: never = userData.email as never;
    const title: never = userData.title as never;
    const requestType = requestData.type === 'tv' ? 'TV Show' : 'Movie';
    new Mailer().mail(
      `You've just requested a ${requestType}: ${requestData.title}`,
      `${requestType}: ${requestData.title}`,
      `Your request has been received and you'll receive an email once it has been added to Plex!`,
      `https://image.tmdb.org/t/p/w500${requestData.thumb}`,
      [email],
      [title],
    );
  }

  async checkQuota() {
    if (!this.user) {
      throw new Error('user required');
    }

    const userResult = await getFromContainer(UserRepository).findOne({
      id: this.user.id,
    });
    if (userResult.isNone()) {
      throw new Error('user required');
    }
    const user = userResult.unwrap();
    if (user.role === UserRole.ADMIN) {
      return 'admin';
    }
    const userQuota = user.quotaCount || 0;
    let quotaCap = 0;

    if (user.profileId) {
      const profileResult = await getFromContainer(ProfileRepository).findOne({
        id: user.profileId,
      });
      if (profileResult.isSome()) {
        quotaCap = profileResult.unwrap().quota;
      }
    }
    if (quotaCap > 0 && userQuota >= quotaCap) {
      return false;
    }

    return true;
  }

  async archive(complete: boolean, removed: boolean, reason = '') {
    const oldReq = this.request;
    const archiveRequest = new ArchiveEntity({
      id: this.request.requestId,
      props: {
        type: this.request.type,
        title: this.request.title,
        thumb: this.request.thumb,
        imdb_id: this.request.imdb_id,
        tmdb_id: this.request.tmdb_id,
        tvdb_id: this.request.tvdb_id,
        users: this.request.users,
        sonarrId: this.request.sonarrId,
        radarrId: this.request.radarrId,
        approved: this.request.approved,
        removed: !!removed,
        removed_reason: reason,
        complete: !!complete,
        timeStamp: this.request.timeStamp ? this.request.timeStamp : new Date(),
      },
    });
    try {
      const { id, ...archiveRequestProps } = archiveRequest.getProps();
      await getFromContainer(ArchiveRepository).updateMany(
        { requestId: id },
        archiveRequestProps,
      );
      await getFromContainer(RequestRepository).deleteMany({
        requestId: this.request.requestId,
      });
      logger.debug(`REQ: Request ${oldReq.title} Archived!`);
    } catch (err) {
      logger.error(`REQ: Archive Error`, err);
    }
  }
}
