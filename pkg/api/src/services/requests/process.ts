import logger from '@/loaders/logger';
import Archive from '@/models/archive';
import { DownloaderType, GetAllDownloaders } from '@/models/downloaders';
import Profile from '@/models/profile';
import Request from '@/models/request';
import { User, UserModel, UserRole } from '@/models/user';
import Radarr from '@/services/downloaders/radarr';
import Sonarr from '@/services/downloaders/sonarr';
import Mailer from '@/services/mail/mailer';
import Discord from '@/services/notifications/discord';
import Telegram from '@/services/notifications/telegram';
import filter from '@/services/requests/filter';
import { showLookup } from '@/services/tmdb/show';

export default class ProcessRequest {
  request: any;

  user: User | undefined;

  constructor(req = {}, usr?: User) {
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
        const existing = await Request.findOne({
          requestId: this.request.id,
        }).exec();
        if (existing) {
          out = await this.existing();
        } else {
          out = await this.create();
        }
        if (quotaPass !== 'admin') {
          const updatedUser = await UserModel.findOneAndUpdate(
            { id: this.user.id },
            { $inc: { quotaCount: 1 } },
            { new: true, useFindAndModify: false },
          ).exec();
          if (!updatedUser) {
            throw new Error('no user found');
          }
          out.quota = updatedUser.quotaCount;
        }
        this.mailRequest();
        this.discordNotify();
      } catch (err) {
        logger.error('REQ: Error', { label: 'requests.process' });
        logger.error(err, { label: 'requests.process' });
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

  async existing(): Promise<{ message: string; user: string; request: any; } | undefined> {
    if (!this.user) {
      throw new Error('user required');
    }
    const profile = this.user.profileId
      ? await Profile.findById(this.user.profileId).exec()
      : false;
    let autoApprove = profile ? profile.autoApprove : false;
    let autoApproveTv = profile ? profile.autoApproveTv : false;
    if (this.user.role === 'admin') {
      autoApprove = true;
      autoApproveTv = true;
    }
    const requestDb = await Request.findOne({
      requestId: this.request.id,
    }).exec();
    if (!requestDb) {
      return;
    }

    if (!requestDb.users.includes(this.user.id)) {
      requestDb.users.push(this.user.id);
      requestDb.markModified('users');
    }
    if (this.request.type === 'tv') {
      const existingSeasons = requestDb.seasons || {};
      // eslint-disable-next-line no-restricted-syntax
      for (const [k, _v] of this.request.seasons) {
        existingSeasons[k] = true;
      }
      requestDb.seasons = existingSeasons;
      this.request.seasons = existingSeasons;
      requestDb.markModified('seasons');
    }
    await requestDb.save();
    if (
      (this.request.type === 'movie' && autoApprove) ||
      (this.request.type === 'tv' && autoApproveTv)
    ) {
      requestDb.approved = true;
      await requestDb.save();
      this.sendToDvr(profile);
    }
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

    const profile = this.user.profileId
      ? await Profile.findById(this.user.profileId).exec()
      : false;
    let autoApprove = false;

    if (profile) {
      if (this.request.type === 'movie') {
        autoApprove = profile.autoApprove ?? false;
      } else {
        autoApprove = profile.autoApproveTv ?? false;
      }
    }

    if (this.user.role === UserRole.Admin) {
      autoApprove = true;
    }

    if (this.request.type === 'tv' && !this.request.tvdb_id) {
      const lookup = await showLookup(this.request.id, true);
      this.request.tvdb_id = lookup.tvdb_id;
    }

    const newRequest = new Request({
      requestId: this.request.id,
      type: this.request.type,
      title: this.request.title,
      thumb: this.request.thumb,
      users: [this.user.id],
      imdb_id: this.request.imdb_id,
      tmdb_id: this.request.tmdb_id,
      tvdb_id: this.request.tvdb_id,
      approved: autoApprove,
      timeStamp: new Date(),
    });

    if (this.request.type === 'tv') {
      newRequest.seasons = this.request.seasons;
    }

    try {
      await newRequest.save();
      if (autoApprove) {
        this.sendToDvr(profile);
      } else {
        logger.info('REQ: Request requires approval, waiting', {
          label: 'requests.process',
        });
        this.pendingDefaults(profile);
      }
    } catch (err) {
      logger.error(`REQ: Unable to save request`, {
        label: 'requests.process',
      });
      logger.error(err, { label: 'requests.process' });
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
        { label: 'requests.process' },
      );
      // eslint-disable-next-line no-restricted-syntax
      for (const [k, _v] of filterMatch) {
        const matchedFilter = filterMatch[k];
        pending[matchedFilter.server] = {
          path: matchedFilter.path,
          profile: matchedFilter.profile,
          tag: matchedFilter.tag,
        };
      }
    } else if (this.request.type === 'movie') {
      const instances = await GetAllDownloaders(DownloaderType.Radarr);
      // eslint-disable-next-line no-restricted-syntax
      for (const instance of instances) {
        if (!instance.id) {
          return;
        }
        if (profile.radarr && profile.radarr[instance.id]) {
          pending[instance.id] = {
            path: instance.path,
            profile: instance.profile,
            tag: false,
          };
        }
      }
    } else {
      const instances = await GetAllDownloaders(DownloaderType.Sonarr);
      // eslint-disable-next-line no-restricted-syntax
      for (const instance of instances) {
        if (!instance.id) {
          return;
        }
        if (profile.sonarr && profile.sonarr[instance.id]) {
          pending[instance.id] = {
            path: instance.path,
            profile: instance.profile,
            tag: false,
          };
        }
      }
    }
    if (Object.keys(pending).length > 0) {
      await Request.updateOne(
        { requestId: this.request.id },
        { $set: { pendingDefault: pending } },
      ).exec();

      logger.debug('REQ: Pending Defaults set for later', {
        label: 'requests.process',
      });
    } else {
      logger.debug('REQ: No Pending Defaults to Set', {
        label: 'requests.process',
      });
    }
  }

  async sendToDvr(profile) {
    const instances = await GetAllDownloaders();
    let filterMatch: any = await filter(this.request);
    if (filterMatch) {
      if (!Array.isArray(filterMatch)) filterMatch = [filterMatch];
      logger.info(
        'REQ: Matched on custom filter, sending to specified server',
        { label: 'requests.process' },
      );
      logger.debug('REQ: Sending to DVR', { label: 'requests.process' });
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
    logger.debug('REQ: Sending to DVR', { label: 'requests.process' });
    // If profile is set use arrs from profile
    if (profile) {
      if (profile.radarr && this.request.type === 'movie') {
        // eslint-disable-next-line no-restricted-syntax
        for (const [k, _v] of profile.radarr) {
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
        for (const [k, _v] of profile.sonarr) {
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
      logger.debug('REQ: No profile for DVR', { label: 'requests.process' });
      if (this.request.type === 'tv') {
        const sonarrs = instances.filter(
          (i) => i.type === DownloaderType.Sonarr,
        );
        // eslint-disable-next-line no-restricted-syntax
        for (const instance of sonarrs) {
          new Sonarr(instance).addShow(false, this.request);
        }
      }
      if (this.request.type === 'movie') {
        const radarrs = instances.filter(
          (i) => i.type === DownloaderType.Radarr,
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
      const instances = await GetAllDownloaders();
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
            await server.getClient().DeleteMovie(rId);
            logger.info(
              `REQ: ${this.request.title} removed from Radarr server - ${serverUuid}`,
              { label: 'requests.process' },
            );
          } catch (err) {
            logger.error(`REQ: Error unable to remove from Radarr`, {
              label: 'requests.process',
            });
            logger.error(err, { label: 'requests.process' });
          }
        }
      }
      if (this.request.sonarrId.length > 0 && this.request.type === 'tv') {
        for (let i = 0; i < Object.keys(this.request.sonarrId).length; i += 1) {
          const sonarrIds = this.request.sonarrId[i];
          const sId = sonarrIds[Object.keys(sonarrIds)[0]];
          const serverUuid = Object.keys(sonarrIds)[0];

          const instance = instances.find((i) => i.id === serverUuid);
          if (!instance) {
            continue;
          }

          try {
            await new Sonarr(instance).remove(sId);
            logger.info(
              `REQ: ${this.request.title} removed from Sonarr server - ${serverUuid}`,
              { label: 'requests.process' },
            );
          } catch (err) {
            logger.error(`REQ: Error unable to remove from Sonarr`, {
              label: 'requests.process',
            });
            logger.error(err, { label: 'requests.process' });
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
    const type = requestData.type === 'tv' ? 'TV Show' : 'Movie';
    const title: any = 'New Request';
    const subtitle: any = `A new request has been added for the ${type} "${requestData.title}"`;
    const image: any = `https://image.tmdb.org/t/p/w500${requestData.thumb}`;
    [new Discord(), new Telegram()].forEach((notification) =>
      notification.send(title, subtitle, userData.title as any, image),
    );
  }

  async mailRequest() {
    const userData: any = this.user;
    if (!userData.email) {
      logger.warn('MAILER: No user email', { label: 'requests.process' });
      return;
    }
    const requestData: any = this.request;
    const email: never = userData.email as never;
    const title: never = userData.title as never;
    const type = requestData.type === 'tv' ? 'TV Show' : 'Movie';
    new Mailer().mail(
      `You've just requested a ${type}: ${requestData.title}`,
      `${type}: ${requestData.title}`,
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

    const user = await UserModel.findById(this.user.id);
    if (!user) throw new Error('user required');

    if (user.role === UserRole.Admin) return 'admin';

    const userQuota = user.quotaCount ? user.quotaCount : 0;
    const profile = user.profileId
      ? await Profile.findById(user.profileId).exec()
      : false;
    const quotaCap = profile ? profile.quota : 0;
    if (!quotaCap) {
      return false;
    }

    if (quotaCap > 0 && userQuota >= quotaCap) {
      return false;
    }

    return true;
  }

  async archive(complete: boolean, removed: boolean, reason = false) {
    const oldReq = this.request;
    const archiveRequest = new Archive({
      requestId: this.request.requestId,
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
    });
    await archiveRequest.save();
    await Request.findOneAndRemove(
      {
        requestId: this.request.requestId,
      },
      { useFindAndModify: false },
    )
      .exec()
      .then(() => {
        logger.debug(`REQ: Request ${oldReq.title} Archived!`, {
          label: 'requests.process',
        });
      })
      .catch((err) => {
        logger.error(`REQ: Archive Error`, { label: 'requests.process' });
        logger.error(err.message, { label: 'requests.process' });
      });
  }
}
