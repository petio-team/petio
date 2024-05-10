/* eslint-disable no-underscore-dangle */

/* eslint-disable prefer-destructuring */

/* eslint-disable guard-for-in */
import axios from 'axios';
import Bluebird from 'bluebird';
import xmlParser from 'xml-js';

import { getFromContainer } from '@/infra/container/container';
import loggerMain from '@/infra/logger/logger';
import { GetLibrariesResponse, PlexClient } from '@/infra/plex';
import { TheMovieDatabaseClient } from '@/infra/tmdb/client';
import { MediaLibraryEntity } from '@/resources/media-library/entity';
import { MediaLibraryRepository } from '@/resources/media-library/repository';
import { MediaServerEntity } from '@/resources/media-server/entity';
import { MovieEntity } from '@/resources/movie/entity';
import { MovieRepository } from '@/resources/movie/repository';
import { ProfileRepository } from '@/resources/profile/repository';
import { RequestRepository } from '@/resources/request/repository';
import { ShowEntity } from '@/resources/show/entity';
import { ShowRepository } from '@/resources/show/repository';
import { UserEntity } from '@/resources/user/entity';
import { UserRepository } from '@/resources/user/repository';
import { UserRole } from '@/resources/user/types';
import Mailer from '@/services/mail/mailer';
import Discord from '@/services/notifications/discord';
import Telegram from '@/services/notifications/telegram';
import { getPlexClient } from '@/services/plex/client';
import ProcessRequest from '@/services/requests/process';
import { showLookup } from '@/services/tmdb/show';
import is from '@/utils/is';

const logger = loggerMain.child({ module: 'plex.library' });

export default class LibraryUpdate {
  full: any;

  mailer: any;

  timestamp: any;

  tmdb: any;

  client: PlexClient;

  constructor(private server: MediaServerEntity) {
    this.mailer = [];
    this.tmdb = 'https://api.themoviedb.org/3/';
    this.full = true;
    this.timestamp = false;
    this.client = getPlexClient(server);
  }

  timeout(ms) {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async partial() {
    logger.debug(`CRON: Running Partial`);
    this.full = false;
    try {
      const recent = await this.getRecent();
      if (!recent || !recent.Metadata || recent.Metadata.length === 0) {
        logger.error('CRON: No recent found');
        return;
      }
      const metadata = recent.Metadata;

      const matched = {};

      await Bluebird.map(
        metadata,
        async (obj) => {
          if (!obj.ratingKey) {
            logger.warn(`CRON: Partial scan - no rating key found`);
            return;
          }
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
            if (!obj.parentRatingKey) {
              logger.warn(`CRON: Partial scan - no parent rating key found`);
              return;
            }
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
        { concurrency: 1 },
      );
      this.execMail();
      logger.debug('Partial Scan Complete');
      this.checkOldRequests();
    } catch (err) {
      logger.error(err, `CRON: Partial scan failed - unable to get recent`);
    }
  }

  async scan() {
    this.timestamp = new Date().toString();
    logger.debug(`CRON: Running Full`);
    try {
      const libraries = await this.getLibraries();
      if (!is.truthy(libraries)) {
        logger.error('CRON: No libraries found');
        return;
      }
      await this.saveLibraries(libraries);
      await this.updateLibraryContent(libraries);
      this.execMail();
      await this.checkOldRequests();
      // await this.deleteOld();
      logger.debug('CRON: Full Scan Complete');
    } catch (err) {
      logger.error(err, `CRON: Error`);
    }
  }

  async getLibraries() {
    try {
      const res = await this.client.library.getLibraries();
      logger.debug('CRON: Found Libraries');
      return res;
    } catch (err) {
      logger.error('CRON: Library update failed!', err);
      throw err;
    }
  }

  async getRecent() {
    try {
      const res = await this.client.library.getRecentlyAdded();
      logger.debug('CRON: Recently Added received');
      return res.MediaContainer;
    } catch (err) {
      logger.error(err, 'CRON: Recently added failed!');
      throw new Error('Recently added failed');
    }
  }

  async saveLibraries(libraries: GetLibrariesResponse) {
    if (!is.truthy(libraries.MediaContainer?.Directory)) {
      logger.warn('CRON: No directories found');
      return;
    }
    await Promise.all(
      libraries.MediaContainer.Directory.map(async (lib) => {
        await this.saveLibrary(lib);
      }),
    );
  }

  async saveLibrary(lib) {
    let libraryItem: any = false;
    const libraryRepo = getFromContainer(MediaLibraryRepository);
    try {
      libraryItem = await libraryRepo.findOne({ uuid: lib.uuid });
    } catch {
      logger.debug('CRON: Library Not found, attempting to create');
    }
    if (!libraryItem) {
      try {
        const newLibrary = MediaLibraryEntity.create({
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
          scannedAt: lib.scannedAt,
          content: lib.content,
          directory: lib.directory,
          contentChangedAt: lib.contentChangedAt,
          hidden: lib.hidden,
        });
        await libraryRepo.create(newLibrary);
      } catch (err) {
        logger.error(`CRON: Error`, err);
      }
    } else {
      let updatedLibraryItem: any = false;
      try {
        updatedLibraryItem = await libraryRepo.updateMany(
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
        );
      } catch (err) {
        logger.error(`CRON: Error`, err);
        return;
      }
      if (updatedLibraryItem) {
        logger.debug(`CRON: Library Updated ${lib.title}`);
      }
    }
  }

  async updateLibraryContent(libraries: GetLibrariesResponse) {
    if (!is.truthy(libraries.MediaContainer?.Directory)) {
      logger.warn('CRON: No directories found');
      return;
    }
    await Bluebird.map(libraries.MediaContainer.Directory, async (lib) => {
      if (!is.truthy(lib.key)) {
        logger.warn(`CRON: No key found for library - ${lib.title}`);
        return;
      }
      try {
        const libContent = await this.getLibrary(lib.key);
        if (!libContent || !libContent.Metadata) {
          logger.warn(`CRON: No content in library skipping - ${lib.title}`, {
            module: 'plex.library',
          });
          return;
        }
        if (!is.truthy(libContent.Metadata)) {
          logger.warn(`CRON: No metadata found in library - ${lib.title}`);
          return;
        }
        const metadata = libContent.Metadata;
        await Bluebird.map(
          metadata,
          async (item) => {
            if (item.type === 'movie') {
              await this.saveMovie(item);
            } else if (item.type === 'show') {
              await this.saveShow(item);
            } else {
              logger.debug(`CRON: Unknown media type - ${item.type}`);
            }
          },
          { concurrency: 2 },
        );
      } catch (err) {
        logger.error(`CRON: Unable to get library content`, err);
      }
    });
  }

  async getLibrary(id) {
    try {
      const res = await this.client.library.getLibraryItems({
        sectionId: id,
        tag: 'all',
      });
      return res.MediaContainer;
    } catch (err) {
      logger.error(`failed to get library content for ${id}`, err);
      throw new Error('Unable to get library content');
    }
  }

  async getMeta(id: number) {
    try {
      const res = await this.client.library.getMetadata({
        ratingKey: id,
      });
      return res.MediaContainer;
    } catch (err) {
      logger.error(`failed to get meta for ${id}`, err);
      throw new Error('Unable to get meta');
    }
  }

  async getSeason(id: number) {
    try {
      const res = await this.client.library.getMetadataChildren({
        ratingKey: id,
      });
      return res.MediaContainer;
    } catch (err) {
      logger.error(`failed to get season data for ${id}`, err);
      throw new Error('Unable to get meta');
    }
  }

  async saveMovie(movie) {
    let movieObj = movie;
    let movieDb: MovieEntity | null = null;
    const { title } = movieObj;
    const externalIds: any = {};
    let tmdbId = false;
    let externalId: any = false;
    logger.debug(`CRON: Movie Job: ${title}`);
    try {
      const movieRepo = getFromContainer(MovieRepository);
      const movieResults = await movieRepo.findOne({
        ratingKey: parseInt(movieObj.ratingKey, 10),
      });
      if (movieResults.isSome()) {
        movieDb = movieResults.unwrap();
      }
    } catch (err) {
      movieDb = null;
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
    const movieEntity = MovieEntity.create({
      title: movieObj.title,
      ratingKey: movieObj.ratingKey,
      key: movieObj.key,
      guid: movieObj.guid,
      studio: movieObj.studio,
      type: movieObj.type,
      titleSort: movieObj.titleSort,
      contentRating: movieObj.contentRating,
      summary: movieObj.summary,
      index: movieObj.index,
      rating: movieObj.rating,
      year: movieObj.year,
      tagline: movieObj.tagline,
      thumb: movieObj.thumb,
      art: movieObj.art,
      banner: movieObj.banner,
      theme: movieObj.theme,
      duration: movieObj.duration,
      originallyAvailableAt: movieObj.originallyAvailableAt,
      leafCount: movieObj.leafCount,
      viewedLeafCount: movieObj.viewedLeafCount,
      childCount: movieObj.childCount,
      addedAt: movieObj.addedAt,
      primaryExtraKey: movieObj.primaryExtraKey,
      ratingImage: movieObj.ratingImage,
      Genre: movieObj.Genre,
      Media: movieObj.Media,
      Director: movieObj.Director,
      Writer: movieObj.Writer,
      Country: movieObj.Country,
      Role: movieObj.Role,
      idSource,
      externalId,
      imdb_id: idSource === 'imdb' ? externalId : externalIds.imdb_id,
      tmdb_id: idSource === 'tmdb' ? externalId : tmdbId,
      petioTimestamp: new Date(),
    });

    try {
      if (!movieDb) {
        await getFromContainer(MovieRepository).create(movieEntity);
        await this.mailAdded(movieObj, externalId);
        logger.debug(`CRON: Movie Added - ${movieObj.title}`);
        return;
      }
      const { id, createdAt, ...rest } = movieEntity.getProps();
      await getFromContainer(MovieRepository).updateMany(
        { id: movieDb.id },
        rest,
      );
    } catch (err) {
      logger.error(`CRON: Failed to save ${title} to Db`, err);
    }
  }

  async saveShow(show) {
    let showObj = show;
    let showDb: any = false;
    const { title } = showObj;
    let externalIds: any = {};
    let tmdbId = '';
    let externalId = '';
    let seasons: any = [];
    logger.debug(`CRON: TV Job: ${title}`);
    const showRepository = getFromContainer(ShowRepository);
    try {
      showDb = await showRepository.findOne({
        ratingKey: parseInt(showObj.ratingKey, 10),
      });
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
      if (!showObj) {
        logger.warn(`CRON: No meta found for ${title}`);
        return;
      }
      seasons = await Bluebird.map(
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
        { concurrency: 1 },
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
          tmdbId = '';
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
    const showEntity = ShowEntity.create({
      ratingKey: showObj.ratingKey,
      key: showObj.key,
      guid: showObj.guid,
      studio: showObj.studio,
      type: showObj.type,
      title: showObj.title,
      titleSort: showObj.titleSort,
      contentRating: showObj.contentRating,
      summary: showObj.summary,
      index: showObj.index,
      rating: showObj.rating,
      year: showObj.year,
      thumb: showObj.thumb,
      art: showObj.art,
      banner: showObj.banner,
      theme: showObj.theme,
      duration: showObj.duration,
      originallyAvailableAt: showObj.originallyAvailableAt,
      leafCount: showObj.leafCount,
      viewedLeafCount: showObj.viewedLeafCount,
      childCount: showObj.childCount,
      addedAt: showObj.addedAt,
      Genre: showObj.Genre,
      idSource,
      externalId,
      imdb_id: idSource === 'imdb' ? externalId : externalIds.imdb_id,
      tvdb_id: idSource === 'tvdb' ? externalId : externalIds.tvdb_id,
      tmdb_id: idSource === 'tmdb' ? externalId : tmdbId,
      petioTimestamp: new Date(),
      seasonData: seasons.map((s) => ({
        seasonNumber: s.seasonNumber,
        title: s.title,
        episodes: s.episodes,
      })),
    });
    try {
      if (!showDb) {
        await showRepository.create(showEntity);
        await this.mailAdded(showObj, showDb.tmdb_id);
        logger.debug(`CRON: Show Added - ${showObj.title}`);
        return;
      }
      const { id, createdAt, ...rest } = showEntity.getProps();
      await showRepository.updateMany({ id: showDb.id }, rest);
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
    const url = `https://plex.tv/api/users?X-Plex-Token=${this.server.token}`;
    try {
      const res = await axios.get(url);
      const dataParse = JSON.parse(
        xmlParser.xml2json(res.data, { compact: false }),
      );
      return dataParse.elements[0].elements;
    } catch (err) {
      logger.error(err, 'CRON: Unable to get friends');
    }
    return {};
  }

  async saveFriend(obj) {
    // Maybe delete all and rebuild each time?
    try {
      let defaultProfile: any;
      const results = await getFromContainer(ProfileRepository).findOne({
        isDefault: true,
      });
      if (results.isSome()) {
        defaultProfile = results.unwrap();
      }

      const newUser = await getFromContainer(UserRepository).create(
        UserEntity.create({
          title: obj.title ?? obj.username ?? 'User',
          username: obj.username ? obj.username : obj.title,
          email:
            obj.email && obj.email !== '' ? obj.email.toLowerCase() : undefined,
          thumbnail: obj.thumb ?? '',
          plexId: obj.id,
          profileId: defaultProfile ? defaultProfile._id.toString() : undefined,
          role: UserRole.USER,
        }),
      );
      logger.debug(`synced friend ${newUser.username}`);
    } catch (err) {
      logger.error(err, 'failed to save friend');
    }
  }

  async mailAdded(plexData, ref_id) {
    const request = await getFromContainer(RequestRepository).findOne({
      tmdb_id: ref_id,
    });
    if (request.isSome()) {
      const data = request.unwrap();
      await Promise.all(
        data.users.map(async (user, i) => {
          await this.sendMail(user, i, request);
        }),
      );
      await new ProcessRequest(request).archive(true, false);
    }
  }

  async sendMail(user, i, request) {
    const results = await getFromContainer(UserRepository).findOne({
      id: user,
    });
    if (results.isNone()) {
      logger.error('CRON: Err: No user data');
      return;
    }
    const userData = results.unwrap();
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

  async externalIdTv(id: string, type: string) {
    const client = getFromContainer(TheMovieDatabaseClient);
    const data = await client.default.findById({
      externalId: id,
      externalSource: type === 'tvdb' ? 'tvdb_id' : 'imdb_id',
    });
    if (data.tv_results && data.tv_results[0]) {
      return (data.tv_results as any[])[0].id;
    }
    return {};
  }

  async tmdbExternalIds(id) {
    const client = getFromContainer(TheMovieDatabaseClient);
    return client.default.tvSeriesExternalIds({
      seriesId: id,
    });
  }

  async externalIdMovie(id: string, type: string) {
    const client = getFromContainer(TheMovieDatabaseClient);
    const data = await client.default.findById({
      externalId: id,
      externalSource: type === 'tvdb' ? 'tvdb_id' : 'imdb_id',
    });
    if (data.movie_results && data.movie_results[0]) {
      return (data.movie_results as any[])[0].id;
    }
    return {};
  }

  async checkOldRequests() {
    logger.debug('CRON: Checking old requests');
    const requests = await getFromContainer(RequestRepository).findAll();
    await Bluebird.map(
      requests,
      async (req) => {
        let onServer: any = false;
        const request = req.getProps();
        if (request.type === 'tv') {
          onServer = await getFromContainer(ShowRepository).findOne({
            tmdb_id: request.tmdbId,
          });
          if (!request.tvdbId) {
            logger.debug(
              `CRON: No TVDB ID for request: ${request.title}, attempting to pull meta`,
            );
            const lookup = await showLookup(request.tmdbId, true);
            request.thumbnail = lookup.poster_path;
            request.tvdbId = lookup.tvdb_id;
            try {
              await getFromContainer(RequestRepository).updateMany(
                { id: request.id },
                {
                  tvdbId: request.tvdbId,
                  thumbnail: request.thumbnail,
                },
              );
              logger.debug(
                `CRON: Meta updated for request: ${request.title}, processing request with updated meta`,
              );
              if (request.tvdbId)
                new ProcessRequest({
                  id: request.id,
                  type: request.type,
                  title: request.title,
                  thumb: request.thumbnail,
                  imdb_id: request.imdbId,
                  tmdb_id: request.tmdbId,
                  tvdb_id: request.tvdbId,
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
          onServer = await getFromContainer(MovieRepository).findOne({
            tmdb_id: request.tmdbId,
          });
        }

        if (onServer) {
          logger.debug(`CRON: Found missed request - ${request.title}`);
          new ProcessRequest(request).archive(true, false, false);
          const emails: any = [];
          const titles: any = [];
          await Promise.all(
            request.users.map(async (user) => {
              const results = await getFromContainer(UserRepository).findOne({
                id: user,
              });
              if (results.isNone()) {
                return;
              }
              const userData = results.unwrap();
              emails.push(userData.email);
              titles.push(userData.title);
            }),
          );
          new Mailer().mail(
            `${request.title} added to Plex!`,
            `${request.title} added to Plex!`,
            'Your request has now been processed and is ready to watch on Plex, thanks for your request!',
            `https://image.tmdb.org/t/p/w500${request.thumbnail}`,
            emails,
            titles,
          );
        }
        return true;
      },
      { concurrency: 2 },
    );
  }

  async deleteOld() {
    const movieRepo = getFromContainer(MovieRepository);
    const showRepo = getFromContainer(ShowRepository);
    const [movies, shows] = await Bluebird.all([
      movieRepo.findAll({
        petioTimestamp: { $ne: this.timestamp },
      }),
      showRepo.findAll({
        petioTimestamp: { $ne: this.timestamp },
      }),
    ]);
    await Bluebird.all([
      Bluebird.map(movies, async (movie) => {
        logger.warn(`deleting movie no longer found in plex: ${movie.title}`);
        await movieRepo.deleteManyByIds([movie.id]);
      }),
      Bluebird.map(shows, async (show) => {
        logger.warn(`deleting show no longer found in plex: ${show.title}`);
        await showRepo.deleteManyByIds([show.id]);
      }),
    ]);
  }
}
