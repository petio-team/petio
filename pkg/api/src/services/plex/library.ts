import axios from 'axios';
import Promise from 'bluebird';
import { ObjectId } from "mongodb";
import xmlParser from 'xml-js';

import externalConfig from "@/config/env/external";
import { config } from '@/config/index';
import logger from '@/loaders/logger';
import Library from '@/models/library';
import Movie from '@/models/movie';
import Profile from '@/models/profile';
import Request from '@/models/request';
import Show from '@/models/show';
import { CreateOrUpdateUser, User, UserModel, UserRole } from '@/models/user';
import Mailer from '@/services/mail/mailer';
import Discord from '@/services/notifications/discord';
import Telegram from '@/services/notifications/telegram';
import ProcessRequest from '@/services/requests/process';
import { showLookup } from '@/services/tmdb/show';

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
    logger.debug(`CRON: Running Partial`, { label: 'plex.library' });
    this.full = false;
    let recent: any = false;
    try {
      recent = await this.getRecent();
    } catch (err) {
      logger.warn(`CRON: Partial scan failed - unable to get recent`, {
        label: 'plex.library',
      });
      logger.error(err, { label: 'plex.library' });
      return;
    }
    const matched = {};

    await Promise.map(
      Object.keys(recent.Metadata),
      async (i) => {
        const obj = recent.Metadata[i];

        if (obj.type === 'movie') {
          if (!matched[obj.ratingKey]) {
            matched[obj.ratingKey] = true;
            await this.saveMovie(obj);
            logger.debug(`CRON: Partial scan - ${obj.title}`, {
              label: 'plex.library',
            });
          }
        } else if (obj.type === 'show') {
          if (matched[obj.ratingKey]) {
            matched[obj.ratingKey] = true;
            await this.saveShow(obj);
            logger.debug(`CRON: Partial scan - ${obj.title}`, {
              label: 'plex.library',
            });
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
              { label: 'plex.library' },
            );
          }
        } else {
          logger.warn(`CRON: Partial scan type not found - ${obj.type}`, {
            label: 'plex.library',
          });
        }
      },
      { concurrency: config.get('general.concurrency') },
    );
    this.execMail();
    logger.debug('Partial Scan Complete', { label: 'plex.library' });
    this.checkOldRequests();
  }

  async scan() {
    this.timestamp = new Date().toString();
    logger.debug(`CRON: Running Full`, { label: 'plex.library' });
    let libraries = false;
    try {
      libraries = await this.getLibraries();
    } catch (err) {
      logger.error(`CRON: Error`, { label: 'plex.library' });
      logger.error(err);
    }

    if (libraries) {
      await this.saveLibraries(libraries);
      await this.updateLibraryContent(libraries);
      this.execMail();
      logger.debug('CRON: Full Scan Complete', { label: 'plex.library' });
      this.checkOldRequests();
      await this.deleteOld();
    } else {
      logger.warn("CRON: Couldn't update libraries", { label: 'plex.library' });
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
      logger.debug('CRON: Found Libraries', { label: 'plex.library' });
      return res.data.MediaContainer;
    } catch (e) {
      logger.warn('CRON: Library update failed!', { label: 'plex.library' });
      throw e;
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
      logger.debug('CRON: Recently Added received', {
        label: 'plex.library',
      });
      return res.data.MediaContainer;
    } catch {
      logger.warn('CRON: Recently added failed!', { label: 'plex.library' });
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
      logger.debug('CRON: Library Not found, attempting to create', {
        label: 'plex.library',
      });
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
        logger.error(`CRON: Error`, { label: 'plex.library' });
        logger.error(err, { label: 'plex.library' });
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
        logger.error(`CRON: Error`, { label: 'plex.library' });
        logger.error(err, { label: 'plex.library' });
      }
      if (updatedLibraryItem) {
        logger.debug(`CRON: Library Updated ${lib.title}`, {
          label: 'plex.library',
        });
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
            label: 'plex.library',
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
              logger.debug(`CRON: Unknown media type - ${obj.type}`, {
                label: 'plex.library',
              });
            }
          },
          { concurrency: config.get('general.concurrency') },
        );
      } catch (err) {
        logger.error(`CRON: Unable to get library content`, {
          label: 'plex.library',
        });
        logger.error(err, { label: 'plex.library' });
        logger.error(err.stack, { label: 'plex.library' });
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
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
      logger.error(e, { label: 'plex.library' });
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
    logger.debug(`CRON: Movie Job: ${title}`, { label: 'plex.library' });
    try {
      movieDb = await Movie.findOne({
        ratingKey: parseInt(movieObj.ratingKey),
      }).exec();
    } catch {
      movieDb = false;
    }
    let idSource = movieObj.guid
      .replace('com.plexapp.agents.', '')
      .split('://')[0];
    if (idSource === 'local' || idSource === 'none') {
      logger.debug(
        `CRON: Item skipped :: Not matched / local only - ${title}`,
        { label: 'plex.library' },
      );
      return;
    }
    try {
      movieObj = await this.getMeta(movieObj.ratingKey);
    } catch {
      logger.warn(`CRON: Unable to fetch meta for ${title}`, {
        label: 'plex.library',
      });
      return;
    }
    if (idSource === 'plex') {
      try {
        if (!Array.isArray(movieObj.Guid)) {
          logger.warn(
            `CRON: Movie couldn't be matched - ${title} - try rematching in Plex`,
            { label: 'plex.library' },
          );
          return;
        }
        for (const guid of movieObj.Guid) {
          if (!guid.id) {
            logger.warn(
              `CRON: Movie couldn't be matched - ${title} - no GUID ID`,
              { label: 'plex.library' },
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
              { label: 'plex.library' },
            );
          } catch {
            tmdbId = false;
            logger.debug(
              `CRON: Couldn't get external ID - ${title} - using agent ${type}`,
              { label: 'plex.library' },
            );
          }
        }
      } catch (e) {
        logger.log(e);
        logger.warn(
          `CRON: Movie couldn't be matched - ${title} - try rematching in Plex`,
          { label: 'plex.library' },
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
          { label: 'plex.library' },
        );
        return;
      }

      if (idSource !== 'tmdb') {
        try {
          tmdbId = await this.externalIdMovie(externalId, idSource);
          logger.debug(
            `CRON: Got external ID - ${title} - using agent ${idSource} : ${tmdbId}`,
            { label: 'plex.library' },
          );
        } catch {
          logger.debug(
            `CRON: Couldn't get external ID - ${title} - using agent ${idSource}`,
            { label: 'plex.library' },
          );
          tmdbId = false;
        }
      }
    }
    if (idSource !== 'tmdb' && !tmdbId) {
      logger.warn(
        `CRON: Movie couldn't be matched - ${title} - try rematching in Plex`,
        { label: 'plex.library' },
      );
      return;
    }
    if (!movieDb) {
      added = true;
      movieDb = new Movie({
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

    if (this.timestamp) {
      movieDb.petioTimestamp = this.timestamp;
    }

    try {
      await movieDb.save();
      if (added) {
        await this.mailAdded(movieObj, movieDb.tmdb_id);
        logger.debug(`CRON: Movie Added - ${movieObj.title}`, {
          label: 'plex.library',
        });
      }
    } catch (err) {
      logger.error(`CRON: Failed to save ${title} to Db`, {
        label: 'plex.library',
      });
      logger.log(err);
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
    logger.debug(`CRON: TV Job: ${title}`, { label: 'plex.library' });
    try {
      showDb = await Show.findOne({
        ratingKey: parseInt(showObj.ratingKey),
      }).exec();
    } catch {
      showDb = false;
    }
    let idSource = showObj.guid
      .replace('com.plexapp.agents.', '')
      .split('://')[0];
    if (idSource === 'local' || idSource === 'none') {
      logger.debug(
        `CRON: Item skipped :: Not matched / local only - ${title}`,
        { label: 'plex.library' },
      );
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
    } catch (e) {
      logger.warn(`CRON: Unable to fetch meta for ${title}`, {
        label: 'plex.library',
      });
      logger.error(e, { label: 'plex.library' });
      return;
    }
    if (idSource === 'plex') {
      try {
        if (!Array.isArray(showObj.Guid)) {
          logger.warn(
            `CRON: Show couldn't be matched - ${title} - try rematching in Plex`,
            { label: 'plex.library' },
          );
          return;
        }
        for (const guid of showObj.Guid) {
          if (!guid.id) {
            logger.warn(
              `CRON: Show couldn't be matched - ${title} - no GUID ID`,
              { label: 'plex.library' },
            );
            return;
          }
          const source = guid.id.split('://');
          externalIds[`${source[0]}_id`] = source[1];
          if (source[0] === 'tmdb') tmdbId = source[1];
        }
      } catch (e) {
        logger.warn(
          `CRON: Show couldn't be matched - ${title} - try rematching in Plex`,
          { label: 'plex.library' },
        );
        logger.error(e, { label: 'plex.library' });
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
          logger.error(err, { label: 'plex.library' });
        }
      }
    }
    if (idSource !== 'tmdb' && !tmdbId) {
      logger.warn(
        `CRON: Show couldn't be matched - ${title} - try rematching in Plex`,
        { label: 'plex.library' },
      );
      return;
    }
    if (!showDb) {
      added = true;
      showDb = new Show({
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
    if (this.timestamp) {
      showDb.petioTimestamp = this.timestamp;
    }
    try {
      await showDb.save();
      if (added) {
        await this.mailAdded(showObj, showDb.tmdb_id);
        logger.debug(`CRON: Show Added - ${showObj.title}`, {
          label: 'plex.library',
        });
      }
    } catch (err) {
      logger.error(`CRON: Failed to save ${title} to Db`, {
        label: 'plex.library',
      });
      logger.error(err, { label: 'plex.library' });
    }
  }

  async updateFriends() {
    logger.debug('CRON: Updating Friends', { label: 'plex.library' });
    let friendList = false;
    try {
      friendList = await this.getFriends();
    } catch (err) {
      logger.error(`CRON: Error getting friend list`, {
        label: 'plex.library',
      });
      logger.error(err, { label: 'plex.library' });
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
    } catch (e) {
      logger.error('CRON: Unable to get friends', { label: 'plex.library' });
      logger.error(e, { label: 'plex.library' });
    }
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
        email: obj.email && obj.email !== "" ? obj.email.toLowerCase() : undefined,
        thumbnail: obj.thumb ?? '',
        plexId: obj.id,
        profileId: defaultProfile ? new ObjectId(defaultProfile._id.toString()) : undefined,
        role: UserRole.User,
        owner: false,
        custom: false,
        disabled: false,
        quotaCount: 0,
      };

      const newUser = await CreateOrUpdateUser(user);
      logger.debug(`synced friend ${newUser.username}`, {
        label: 'plex.library',
      });
    } catch (e) {
      logger.error('failed to save friend', {
        label: 'plex.library',
      });
      logger.error(e, {
        label: 'plex.library',
      });
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
      logger.error('CRON: Err: No user data', { label: 'plex.library' });
      return;
    }
    this.discordNotify(userData, request);
    if (!userData.email) {
      logger.warn('CRON: Err: User has no email', { label: 'plex.library' });
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

    logger.debug(`CRON: Mailer updated`, { label: 'plex.library' });
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
    logger.debug('MAILER: Parsing mail queue', { label: 'plex.library' });
    this.mailer.forEach((mail, index) => {
      setTimeout(() => {
        new Mailer().mail(mail[0], mail[1], mail[2], mail[3], mail[4], mail[5]);
      }, 10000 * (index + 1));
    });
    this.mailer = [];
  }

  async externalIdTv(id, type) {
    const url = `${this.tmdb}find/${id}?api_key=${externalConfig.tmdbApiKey}&language=en-US&external_source=${type}_id`;
    const res = await axios.get(url);
    return res.data.tv_results[0].id;
  }

  async tmdbExternalIds(id) {
    const url = `${this.tmdb}tv/${id}/external_ids?api_key=${externalConfig.tmdbApiKey}`;
    const res = await axios.get(url);
    return res.data;
  }

  async externalIdMovie(id, type) {
    const url = `${this.tmdb}find/${id}?api_key=${externalConfig.tmdbApiKey}&language=en-US&external_source=${type}_id`;
    const res = await axios.get(url);
    return res.data.movie_results[0].id;
  }

  async checkOldRequests() {
    logger.debug('CRON: Checking old requests', { label: 'plex.library' });
    const requests = await Request.find().exec();
    for (const element of requests) {
      let onServer: any = false;
      const request = element;
      if (request.type === 'tv') {
        onServer = await Show.findOne({ tmdb_id: request.tmdb_id }).exec();
        if (!request.tvdb_id) {
          logger.debug(
            `CRON: No TVDB ID for request: ${request.title}, attempting to pull meta`,
            { label: 'plex.library' },
          );
          const lookup = await showLookup(request.tmdb_id, true);
          request.thumb = lookup.poster_path;
          request.tvdb_id = lookup.tvdb_id;
          try {
            await request.save();
            logger.debug(
              `CRON: Meta updated for request: ${request.title}, processing request with updated meta`,
              { label: 'plex.library' },
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
              { label: 'plex.library' },
            );
          }
        }
      }
      if (request.type === 'movie') {
        onServer = await Movie.findOne({ tmdb_id: request.tmdb_id }).exec();
      }

      if (onServer) {
        logger.debug(`CRON: Found missed request - ${request.title}`, {
          label: 'plex.library',
        });
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
    const deleteMovies = await Movie.find({
      petioTimestamp: { $ne: this.timestamp },
    }).exec();
    for (const i in deleteMovies) {
      const deleteMovie = deleteMovies[i];
      logger.warn(
        `CRON: Deleting Movie - ${deleteMovie.title} - no longer found in Plex`,
        { label: 'plex.library' },
      );
      await Movie.findOneAndRemove(
        { _id: deleteMovie._id },
        { useFindAndModify: false },
      ).exec();
    }
    const deleteShows = await Show.find({
      petioTimestamp: { $ne: this.timestamp },
    }).exec();
    for (const i in deleteShows) {
      const deleteShow = deleteShows[i];
      logger.warn(
        `CRON: Deleting TV Show - ${deleteShow.title} - no longer found in Plex`,
        { label: 'plex.library' },
      );
      await Show.findOneAndRemove(
        { _id: deleteShow._id },
        { useFindAndModify: false },
      ).exec();
    }
  }
}
