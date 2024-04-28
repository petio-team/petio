import axios from 'axios';
import Bluebird from 'bluebird';
import xmlParser from 'xml-js';

import { config } from '@/config/index';
import { TMDB_API_KEY } from '@/infra/config/env';
import loggerMain from '@/infra/logger/logger';
import Library from '@/models/library';
import MovieModel from '@/models/movie';
import Profile from '@/models/profile';
import Request from '@/models/request';
import ShowModel from '@/models/show';
import { CreateOrUpdateUser, User, UserModel, UserRole } from '@/models/user';
import Mailer from '@/services/mail/mailer';
import Discord from '@/services/notifications/discord';
import Telegram from '@/services/notifications/telegram';
import ProcessRequest from '@/services/requests/process';
import { showLookup } from '@/services/tmdb/show';

const logger = loggerMain.child({ module: 'plex.library' });

export default class LibraryUpdate {
  full: any;

  mailer: any;

  timestamp: any;

  tmdb: any;

  constructor() {
    this.mailer = [];
    this.tmdb = 'https://api.themoviedb.org/3/';
    this.full = true;
    this.timestamp = false;
  }

  timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async partial() {
    logger.debug(`CRON: Running Partial`);
    this.full = false;
    let recent: any = false;
    try {
      recent = await this.getRecent();
    } catch (err) {
      logger.error(`CRON: Partial scan failed - unable to get recent`, err);
      return;
    }
    const matched = {};

    await Bluebird.map(
      Object.keys(recent.Metadata),
      async (i) => {
        const obj = recent.Metadata[i];

        if (obj.type === 'movie') {
          if (!matched[obj.ratingKey]) {
            matched[obj.ratingKey] = true;
            await this.saveMovie(obj);
            logger.debug(`CRON: Partial scan - ${obj.title}`);
          }
        } else if (obj.type === 'show') {
          if (matched[obj.ratingKey]) {
            matched[obj.ratingKey] = true;
            await this.saveShow(obj);
            logger.debug(`CRON: Partial scan - ${obj.title}`);
          }
        } else if (obj.type === 'season') {
          if (!matched[obj.parentRatingKey]) {
            matched[obj.parentRatingKey] = true;
            const parent = {
              ratingKey: obj.parentRatingKey,
              guid: obj.parentGuid,
              key: obj.parentKey,
              type: 'show',
              title: obj.parentTitle,
              contentRating: '',
              summary: '',
              index: obj.index,
              rating: '',
              year: '',
              thumb: '',
              art: '',
              banner: '',
              theme: '',
              duration: '',
              originallyAvailableAt: '',
              leafCount: '',
              viewedLeafCount: '',
              childCount: '',
              addedAt: '',
              updatedAt: '',
              Genre: '',
              studio: '',
              titleSort: '',
            };

            await this.saveShow(parent);
            logger.debug(
              `CRON: Partial scan - ${parent.title} - Built from series`,
            );
          }
        } else {
          logger.warn(`CRON: Partial scan type not found - ${obj.type}`);
        }
      },
      { concurrency: config.get('general.concurrency') },
    );
    this.execMail();
    logger.debug('Partial Scan Complete');
    this.checkOldRequests();
  }

  async scan() {
    this.timestamp = new Date().toString();
    logger.debug(`CRON: Running Full`);
    let libraries = false;
    try {
      libraries = await this.getLibraries();
    } catch (err) {
      logger.error(`CRON: Error`, err);
    }

    if (libraries) {
      await this.saveLibraries(libraries);
      await this.updateLibraryContent(libraries);
      this.execMail();
      logger.debug('CRON: Full Scan Complete');
      this.checkOldRequests();
      // await this.deleteOld();
    } else {
      logger.warn("CRON: Couldn't update libraries");
    }
  }

  async getLibraries() {
    const url = `${config.get('plex.protocol')}://${config.get(
      'plex.host',
    )}:${config.get('plex.port')}/library/sections/?X-Plex-Token=${config.get(
      'plex.token',
    )}`;
    try {
      const res = await axios.get(url);
      logger.debug('CRON: Found Libraries');
      return res.data.MediaContainer;
    } catch (err) {
      logger.error('CRON: Library update failed!', err);
      throw err;
    }
  }

  async getRecent() {
    const url = `${config.get('plex.protocol')}://${config.get(
      'plex.host',
    )}:${config.get(
      'plex.port',
    )}/library/recentlyAdded/?X-Plex-Token=${config.get('plex.token')}`;
    try {
      const res = await axios.get(url);
      logger.debug('CRON: Recently Added received');
      return res.data.MediaContainer;
    } catch (err) {
      logger.error('CRON: Recently added failed!', err);
      throw new Error('Recently added failed');
    }
  }

  async saveLibraries(libraries) {
    await Promise.all(
      libraries.Directory.map(async (lib) => {
        await this.saveLibrary(lib);
      }),
    );
  }

  async saveLibrary(lib) {
    let libraryItem: any = false;
    try {
      libraryItem = await Library.findOne({ uuid: lib.uuid }).exec();
    } catch {
      logger.debug('CRON: Library Not found, attempting to create');
    }
    if (!libraryItem) {
      try {
        const newLibrary = new Library({
          allowSync: lib.allowSync,
          art: lib.art,
          composite: lib.composite,
          filters: lib.filters,
          refreshing: lib.refreshing,
          thumb: lib.thumb,
          key: lib.key,
          type: lib.type,
          title: lib.title,
          agent: lib.agent,
          scanner: lib.scanner,
          language: lib.language,
          uuid: lib.uuid,
          updatedAt: lib.updatedAt,
          createdAt: lib.createdAt,
          scannedAt: lib.scannedAt,
          content: lib.content,
          directory: lib.directory,
          contentChangedAt: lib.contentChangedAt,
          hidden: lib.hidden,
        });
        await newLibrary.save();
      } catch (err) {
        logger.error(`CRON: Error`, err);
      }
    } else {
      let updatedLibraryItem: any = false;
      try {
        updatedLibraryItem = await Library.updateOne(
          { uuid: lib.uuid },
          {
            $set: {
              allowSync: lib.allowSync,
              art: lib.art,
              composite: lib.composite,
              filters: lib.filters,
              refreshing: lib.refreshing,
              thumb: lib.thumb,
              key: lib.key,
              type: lib.type,
              title: lib.title,
              agent: lib.agent,
              scanner: lib.scanner,
              language: lib.language,
              uuid: lib.uuid,
              updatedAt: lib.updatedAt,
              createdAt: lib.createdAt,
              scannedAt: lib.scannedAt,
              content: lib.content,
              directory: lib.directory,
              contentChangedAt: lib.contentChangedAt,
              hidden: lib.hidden,
            },
          },
          { useFindAndModify: false },
        ).exec();
      } catch (err) {
        logger.error(`CRON: Error`, err);
        return;
      }
      if (updatedLibraryItem) {
        logger.debug(`CRON: Library Updated ${lib.title}`);
      }
    }
  }

  async updateLibraryContent(libraries) {
    for (const l in libraries.Directory) {
      const lib = libraries.Directory[l];
      const music: any = [];
      try {
        const libContent = await this.getLibrary(lib.key);
        if (!libContent || !libContent.Metadata) {
          logger.warn(`CRON: No content in library skipping - ${lib.title}`, {
            module: 'plex.library',
          });
          return;
        }
        await Promise.map(
          Object.keys(libContent.Metadata),
          async (item) => {
            const obj: any = libContent.Metadata[item];
            if (obj.type === 'movie') {
              await this.saveMovie(obj);
            } else if (obj.type === 'show') {
              await this.saveShow(obj);
            } else {
              logger.debug(`CRON: Unknown media type - ${obj.type}`);
            }
          },
          { concurrency: config.get('general.concurrency') },
        );
      } catch (err) {
        logger.error(`CRON: Unable to get library content`, err);
      }
    }
  }

  async getLibrary(id) {
    const url = `${config.get('plex.protocol')}://${config.get(
      'plex.host',
    )}:${config.get(
      'plex.port',
    )}/library/sections/${id}/all?X-Plex-Token=${config.get('plex.token')}`;
    try {
      const res = await axios.get(url);
      return res.data.MediaContainer;
    } catch (err) {
      logger.error(`failed to get library content for ${id}`, err);
      throw new Error('Unable to get library content');
    }
  }

  async getMeta(id) {
    const url = `${config.get('plex.protocol')}://${config.get(
      'plex.host',
    )}:${config.get(
      'plex.port',
    )}/library/metadata/${id}?includeChildren=1&X-Plex-Token=${config.get(
      'plex.token',
    )}`;
    try {
      const res = await axios.get(url);
      return res.data.MediaContainer.Metadata[0];
    } catch (err) {
      logger.error(`failed to get meta for ${id}`, err);
      throw new Error('Unable to get meta');
    }
  }

  async getSeason(id) {
    const url = `${config.get('plex.protocol')}://${config.get(
      'plex.host',
    )}:${config.get(
      'plex.port',
    )}/library/metadata/${id}/children?X-Plex-Token=${config.get(
      'plex.token',
    )}`;
    try {
      const res = await axios.get(url);
      return res.data.MediaContainer.Metadata;
    } catch (err) {
      logger.error(`failed to get season data for ${id}`, err);
      throw new Error('Unable to get meta');
    }
  }

  async saveMovie(movieObj) {
    let movieDb: any = false;
    const { title } = movieObj;
    const externalIds: any = {};
    let tmdbId = false;
    let externalId: any = false;
    let added = false;
    logger.debug(`CRON: Movie Job: ${title}`);
    try {
      movieDb = await MovieModel.findOne({
        ratingKey: parseInt(movieObj.ratingKey, 10),
      }).exec();
    } catch {
      movieDb = false;
    }
    let idSource = movieObj.guid
      .replace('com.plexapp.agents.', '')
      .split('://')[0];
    if (idSource === 'local' || idSource === 'none') {
      logger.debug(`CRON: Item skipped :: Not matched / local only - ${title}`);
      return;
    }
    try {
      movieObj = await this.getMeta(movieObj.ratingKey);
    } catch (err) {
      logger.error(`CRON: Unable to fetch meta for ${title}`, err);
      return;
    }
    if (idSource === 'plex') {
      try {
        if (!Array.isArray(movieObj.Guid)) {
          logger.warn(
            `CRON: Movie couldn't be matched - ${title} - try rematching in Plex`,
          );
          return;
        }
        for (const guid of movieObj.Guid) {
          if (!guid.id) {
            logger.warn(
              `CRON: Movie couldn't be matched - ${title} - no GUID ID`,
            );
            return;
          }
          const source = guid.id.split('://');
          externalIds[`${source[0]}_id`] = source[1];
          if (source[0] === 'tmdb') tmdbId = source[1];
        }

        if (!externalIds.tmdb_id) {
          const type = Object.keys(externalIds)[0].replace('_id', '');
          try {
            tmdbId = await this.externalIdMovie(
              externalIds[Object.keys(externalIds)[0]].replace('/', ''),
              type,
            );
            logger.debug(
              `CRON: Got external ID - ${title} - using agent ${type} : ${tmdbId}`,
            );
          } catch {
            tmdbId = false;
            logger.debug(
              `CRON: Couldn't get external ID - ${title} - using agent ${type}`,
            );
          }
        }
      } catch (err) {
        logger.warn(
          `CRON: Movie couldn't be matched - ${title} - try rematching in Plex`,
          err,
        );
        return;
      }
    } else {
      if (idSource === 'themoviedb') {
        idSource = 'tmdb';
      }

      try {
        externalId = movieObj.guid
          .replace('com.plexapp.agents.', '')
          .split('://')[1]
          .split('?')[0];
      } catch (e) {
        logger.warn(
          `CRON: Movie couldn't be matched - ${title} - GUID Error #2 - GUID is - ${movieObj.guid}`,
        );
        return;
      }

      if (idSource !== 'tmdb') {
        try {
          tmdbId = await this.externalIdMovie(externalId, idSource);
          logger.debug(
            `CRON: Got external ID - ${title} - using agent ${idSource} : ${tmdbId}`,
          );
        } catch (err) {
          logger.debug(
            `CRON: Couldn't get external ID - ${title} - using agent ${idSource}`,
            err,
          );
          tmdbId = false;
        }
      }
    }
    if (idSource !== 'tmdb' && !tmdbId) {
      logger.warn(
        `CRON: Movie couldn't be matched - ${title} - try rematching in Plex`,
      );
      return;
    }
    if (!movieDb) {
      added = true;
      movieDb = new MovieModel({
        ratingKey: movieObj.ratingKey,
      });
    }
    movieDb.title = movieObj.title;
    movieDb.ratingKey = movieObj.ratingKey;
    movieDb.studio = movieObj.studio;
    movieDb.type = movieObj.type;
    movieDb.contentRating = movieObj.contentRating;
    movieDb.rating = movieObj.rating;
    movieDb.year = movieObj.year;
    movieDb.addedAt = movieObj.addedAt;
    movieDb.updatedAt = movieObj.updatedAt;
    movieDb.Media = movieObj.Media;
    movieDb.Genre = movieObj.Genre;
    movieDb.Director = movieObj.Director;
    movieDb.Writer = movieObj.Writer;
    movieDb.Country = movieObj.Country;
    movieDb.Role = movieObj.Role;
    movieDb.idSource = idSource;
    movieDb.externalId = externalId;
    movieDb.imdb_id = externalIds.hasOwnProperty('imdb_id')
      ? externalIds.imdb_id
      : false;
    movieDb.tmdb_id = idSource === 'tmdb' ? externalId : tmdbId;

    try {
      await movieDb.save();
      if (added) {
        await this.mailAdded(movieObj, movieDb.tmdb_id);
        logger.debug(`CRON: Movie Added - ${movieObj.title}`);
      }
    } catch (err) {
      logger.error(`CRON: Failed to save ${title} to Db`, err);
    }
  }

  async saveShow(showObj) {
    let showDb: any = false;
    const { title } = showObj;
    let externalIds: any = {};
    let tmdbId = false;
    let externalId = false;
    let added = false;
    let seasons: any = [];
    logger.debug(`CRON: TV Job: ${title}`);
    try {
      showDb = await ShowModel.findOne({
        ratingKey: parseInt(showObj.ratingKey, 10),
      }).exec();
    } catch {
      showDb = false;
    }
    let idSource = showObj.guid
      .replace('com.plexapp.agents.', '')
      .split('://')[0];
    if (idSource === 'local' || idSource === 'none') {
      logger.debug(`CRON: Item skipped :: Not matched / local only - ${title}`);
      return;
    }
    try {
      showObj = await this.getMeta(showObj.ratingKey);
      seasons = await Promise.map(
        showObj.Children.Metadata,
        async (season: any) => {
          const seasonData = await this.getSeason(season.ratingKey);
          const thisSeason = {
            seasonNumber: season.index,
            title: season.title,
            episodes: {},
          };
          for (const e in seasonData) {
            const ep = seasonData[e];
            thisSeason.episodes[ep.index] = {
              title: ep.title,
              episodeNumber: ep.index,
              seasonNumber: ep.parentIndex,
              resolution: ep.Media[0].videoResolution,
              videoCodec: ep.Media[0].videoCodec,
              audioCodec: ep.Media[0].audioCodec,
            };
          }
          return thisSeason;
        },
        { concurrency: config.get('general.concurrency') },
      );
    } catch (err) {
      logger.warn(`CRON: Unable to fetch meta for ${title}`, err);
      return;
    }
    if (idSource === 'plex') {
      try {
        if (!Array.isArray(showObj.Guid)) {
          logger.warn(
            `CRON: Show couldn't be matched - ${title} - try rematching in Plex`,
          );
          return;
        }
        for (const guid of showObj.Guid) {
          if (!guid.id) {
            logger.warn(
              `CRON: Show couldn't be matched - ${title} - no GUID ID`,
            );
            return;
          }
          const source = guid.id.split('://');
          externalIds[`${source[0]}_id`] = source[1];
          if (source[0] === 'tmdb') tmdbId = source[1];
        }
      } catch (err) {
        logger.warn(
          `CRON: Show couldn't be matched - ${title} - try rematching in Plex`,
          err,
        );
        return;
      }
    } else {
      if (idSource === 'thetvdb') {
        idSource = 'tvdb';
      }
      if (idSource === 'themoviedb') {
        idSource = 'tmdb';
      }
      externalId = showObj.guid
        .replace('com.plexapp.agents.', '')
        .split('://')[1]
        .split('?')[0];

      if (idSource !== 'tmdb') {
        try {
          tmdbId = await this.externalIdTv(externalId, idSource);
        } catch {
          tmdbId = false;
        }
      } else {
        try {
          externalIds = await this.tmdbExternalIds(externalId);
        } catch (err) {
          logger.error(`failed to get external ids`, err);
        }
      }
    }
    if (idSource !== 'tmdb' && !tmdbId) {
      logger.warn(
        `CRON: Show couldn't be matched - ${title} - try rematching in Plex`,
      );
      return;
    }
    if (!showDb) {
      added = true;
      showDb = new ShowModel({
        ratingKey: showObj.ratingKey,
      });
    }
    showDb.ratingKey = showObj.ratingKey;
    showDb.key = showObj.key;
    showDb.guid = showObj.guid;
    showDb.studio = showObj.studio;
    showDb.type = showObj.type;
    showDb.title = showObj.title;
    showDb.titleSort = showObj.titleSort;
    showDb.contentRating = showObj.contentRating;
    showDb.rating = showObj.rating;
    showDb.year = showObj.year;
    showDb.leafCount = showObj.leafCount;
    showDb.childCount = showObj.childCount;
    showDb.addedAt = showObj.addedAt;
    showDb.updatedAt = showObj.updatedAt;
    showDb.Genre = showObj.Genre;
    showDb.idSource = idSource;
    showDb.externalId = externalId;
    showDb.imdb_id = idSource === 'imdb' ? externalId : externalIds.imdb_id;
    showDb.tvdb_id = idSource === 'tvdb' ? externalId : externalIds.tvdb_id;
    showDb.tmdb_id = idSource === 'tmdb' ? externalId : tmdbId;
    showDb.seasonData = {};
    for (const s in seasons) {
      const season: any = seasons[s];
      showDb.seasonData[season.seasonNumber] = {
        seasonNumber: season.seasonNumber,
        title: season.title,
        episodes: season.episodes,
      };
    }
    try {
      await showDb.save();
      if (added) {
        await this.mailAdded(showObj, showDb.tmdb_id);
        logger.debug(`CRON: Show Added - ${showObj.title}`);
      }
    } catch (err) {
      logger.error(`CRON: Failed to save ${title} to Db`, err);
    }
  }

  async updateFriends() {
    logger.debug('CRON: Updating Friends');
    let friendList = false;
    try {
      friendList = await this.getFriends();
    } catch (err) {
      logger.error(`CRON: Error getting friend list`, err);
    }
    if (friendList) {
      await Promise.all(
        Object.keys(friendList).map(async (item) => {
          await this.saveFriend(friendList[item].attributes);
        }),
      );
    }
  }

  async getFriends() {
    const url = `https://plex.tv/api/users?X-Plex-Token=${config.get(
      'plex.token',
    )}`;
    try {
      const res = await axios.get(url);
      const dataParse = JSON.parse(
        xmlParser.xml2json(res.data, { compact: false }),
      );
      return dataParse.elements[0].elements;
    } catch (err) {
      logger.error('CRON: Unable to get friends', err);
    }
    return {};
  }

  async saveFriend(obj) {
    // Maybe delete all and rebuild each time?
    try {
      let defaultProfile: any;
      const results: any = await Profile.findOne({ isDefault: true }).exec();
      if (results) {
        defaultProfile = results.toObject();
      }

      const user: User = {
        title: obj.title ?? obj.username ?? 'User',
        username: obj.username ? obj.username : obj.title,
        email:
          obj.email && obj.email !== '' ? obj.email.toLowerCase() : undefined,
        thumbnail: obj.thumb ?? '',
        plexId: obj.id,
        // eslint-disable-next-line no-underscore-dangle
        profileId: defaultProfile ? defaultProfile._id.toString() : undefined,
        role: UserRole.User,
        owner: false,
        custom: false,
        disabled: false,
        quotaCount: 0,
      };

      const newUser = await CreateOrUpdateUser(user);
      logger.debug(`synced friend ${newUser.username}`);
    } catch (err) {
      logger.error(err, 'failed to save friend');
    }
  }

  async mailAdded(plexData, ref_id) {
    const request = await Request.findOne({ tmdb_id: ref_id }).exec();
    if (request) {
      await Promise.all(
        request.users.map(async (user, i) => {
          await this.sendMail(user, i, request);
        }),
      );
      await new ProcessRequest(request).archive(true, false);
    }
  }

  async sendMail(user, i, request) {
    const userData = await UserModel.findOne({ id: user }).exec();
    if (!userData) {
      logger.error('CRON: Err: No user data');
      return;
    }
    this.discordNotify(userData, request);
    if (!userData.email) {
      logger.warn('CRON: Err: User has no email');
      return;
    }

    this.mailer.push([
      `${request.title} added to Plex!`,
      `${request.title} added to Plex!`,
      'Your request has now been processed and is ready to watch on Plex, thanks for your request!',
      `https://image.tmdb.org/t/p/w500${request.thumb}`,
      [userData.email],
      [userData.title],
    ]);

    logger.debug(`CRON: Mailer updated`);
  }

  discordNotify(user, request) {
    const type = request.type === 'tv' ? 'TV Show' : 'Movie';
    const title: any = `${request.title} added to Plex!`;
    const subtitle: any = `The ${type} "${request.title}" has been processed and is now available to watch on Plex"`;
    const image: any = `https://image.tmdb.org/t/p/w500${request.thumb}`;
    [new Discord(), new Telegram()].forEach((notification) =>
      notification.send(title, subtitle, user.title, image),
    );
  }

  execMail() {
    logger.debug('MAILER: Parsing mail queue');
    this.mailer.forEach((mail, index) => {
      setTimeout(() => {
        new Mailer().mail(mail[0], mail[1], mail[2], mail[3], mail[4], mail[5]);
      }, 10000 * (index + 1));
    });
    this.mailer = [];
  }

  async externalIdTv(id, type) {
    const url = `${this.tmdb}find/${id}?api_key=${TMDB_API_KEY}&language=en-US&external_source=${type}_id`;
    const res = await axios.get(url);
    return res.data.tv_results[0].id;
  }

  async tmdbExternalIds(id) {
    const url = `${this.tmdb}tv/${id}/external_ids?api_key=${TMDB_API_KEY}`;
    const res = await axios.get(url);
    return res.data;
  }

  async externalIdMovie(id, type) {
    const url = `${this.tmdb}find/${id}?api_key=${TMDB_API_KEY}&language=en-US&external_source=${type}_id`;
    const res = await axios.get(url);
    return res.data.movie_results[0].id;
  }

  async checkOldRequests() {
    logger.debug('CRON: Checking old requests');
    const requests = await Request.find().exec();
    for (const element of requests) {
      let onServer: any = false;
      const request = element;
      if (request.type === 'tv') {
        onServer = await ShowModel.findOne({ tmdb_id: request.tmdb_id }).exec();
        if (!request.tvdb_id) {
          logger.debug(
            `CRON: No TVDB ID for request: ${request.title}, attempting to pull meta`,
          );
          const lookup = await showLookup(request.tmdb_id, true);
          request.thumb = lookup.poster_path;
          request.tvdb_id = lookup.tvdb_id;
          try {
            await request.save();
            logger.debug(
              `CRON: Meta updated for request: ${request.title}, processing request with updated meta`,
            );
            if (request.tvdb_id)
              new ProcessRequest({
                id: request.requestId,
                type: request.type,
                title: request.title,
                thumb: request.thumb,
                imdb_id: request.imdb_id,
                tmdb_id: request.tmdb_id,
                tvdb_id: request.tvdb_id,
                approved: request.approved,
              }).sendToDvr(false);
          } catch (err) {
            logger.warn(
              `CRON: Failed to update meta for request: ${request.title}`,
              err,
            );
          }
        }
      }
      if (request.type === 'movie') {
        onServer = await MovieModel.findOne({
          tmdb_id: request.tmdb_id,
        }).exec();
      }

      if (onServer) {
        logger.debug(`CRON: Found missed request - ${request.title}`);
        new ProcessRequest(request).archive(true, false, false);
        const emails: any = [];
        const titles: any = [];
        await Promise.all(
          request.users.map(async (user) => {
            const userData = await UserModel.findOne({ id: user }).exec();
            if (!userData) return;
            emails.push(userData.email);
            titles.push(userData.title);
          }),
        );
        new Mailer().mail(
          `${request.title} added to Plex!`,
          `${request.title} added to Plex!`,
          'Your request has now been processed and is ready to watch on Plex, thanks for your request!',
          `https://image.tmdb.org/t/p/w500${request.thumb}`,
          emails,
          titles,
        );
      }
    }
  }

  async deleteOld() {
    const [movies, shows] = await Bluebird.all([
      MovieModel.find({
        petioTimestamp: { $ne: this.timestamp },
      }).exec(),
      ShowModel.find({
        petioTimestamp: { $ne: this.timestamp },
      }).exec(),
    ]);
    await Bluebird.all([
      Bluebird.map(movies, async (movie) => {
        logger.warn(`deleting movie no longer found in plex: ${movie.title}`);
        await MovieModel.findOneAndRemove(
          // eslint-disable-next-line no-underscore-dangle
          { _id: movie._id },
          { useFindAndModify: false },
        ).exec();
      }),
      Bluebird.map(shows, async (show) => {
        logger.warn(`deleting show no longer found in plex: ${show.title}`);
        await ShowModel.findOneAndRemove(
          // eslint-disable-next-line no-underscore-dangle
          { _id: show._id },
          { useFindAndModify: false },
        ).exec();
      }),
    ]);
  }
}
