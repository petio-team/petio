import Promise from "bluebird";
import xmlParser from "xml-js";
import bcrypt from "bcryptjs";
import axios from "axios";

import Library from "../models/library";
import Movie from "../models/movie";
import Music from "../models/artist";
import Show from "../models/show";
import User from "../models/user";
import Request from "../models/request";
import Profile from "../models/profile";
import Mailer from "../mail/mailer";
import processRequest from "../requests/process";
import logger from "../app/logger";
import Discord from "../notifications/discord";
import Telegram from "../notifications/telegram";
import { showLookup } from "../tmdb/show";
import MusicMeta from "../meta/musicBrainz";
import { conf } from "../app/config";
import { tmdbApiKey } from "../app/env";

export default class LibraryUpdate {
  full: any;
  mailer: any;
  timestamp: any;
  tmdb: any;
  constructor() {
    this.mailer = [];
    this.tmdb = "https://api.themoviedb.org/3/";
    this.full = true;
    this.timestamp = false;
  }

  timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async partial() {
    logger.verbose(`CRON: Running Partial`);
    this.full = false;
    let recent: any = false;
    try {
      await this.updateFriends();
      recent = await this.getRecent();
    } catch (err) {
      logger.warn(`CRON: Partial scan failed - unable to get recent`);
      logger.error(err);
      return;
    }
    let matched = {};

    await Promise.map(
      Object.keys(recent.Metadata),
      async (i) => {
        let obj = recent.Metadata[i];

        if (obj.type === "movie") {
          if (!matched[obj.ratingKey]) {
            matched[obj.ratingKey] = true;
            await this.saveMovie(obj);
            logger.verbose(`CRON: Partial scan - ${obj.title}`);
          }
        } else if (obj.type === "artist") {
          if (!matched[obj.ratingKey]) {
            matched[obj.ratingKey] = true;
            await this.saveMusic(obj);
          }
        } else if (obj.type === "show") {
          if (matched[obj.ratingKey]) {
            matched[obj.ratingKey] = true;
            await this.saveShow(obj);
            logger.verbose(`CRON: Partial scan - ${obj.title}`);
          }
        } else if (obj.type === "season") {
          if (!matched[obj.parentRatingKey]) {
            matched[obj.parentRatingKey] = true;
            let parent = {
              ratingKey: obj.parentRatingKey,
              guid: obj.parentGuid,
              key: obj.parentKey,
              type: "show",
              title: obj.parentTitle,
              contentRating: "",
              summary: "",
              index: obj.index,
              rating: "",
              year: "",
              thumb: "",
              art: "",
              banner: "",
              theme: "",
              duration: "",
              originallyAvailableAt: "",
              leafCount: "",
              viewedLeafCount: "",
              childCount: "",
              addedAt: "",
              updatedAt: "",
              Genre: "",
              studio: "",
              titleSort: "",
            };

            await this.saveShow(parent);
            logger.verbose(
              `CRON: Partial scan - ${parent.title} - Built from series`
            );
          }
        } else {
          logger.warn(`CRON: Partial scan type not found - ${obj.type}`);
        }
      },
      { concurrency: 10 }
    );
    this.execMail();
    logger.verbose("Partial Scan Complete");
    this.checkOldRequests();
    return;
  }

  async scan() {
    this.timestamp = new Date().toString();
    logger.verbose(`CRON: Running Full`);
    await this.createAdmin();
    await this.updateFriends();
    let libraries = false;
    try {
      libraries = await this.getLibraries();
    } catch (err) {
      logger.error(`CRON: Error`);
      logger.error(err);
    }

    if (libraries) {
      await this.saveLibraries(libraries);
      await this.updateLibraryContent(libraries);
      this.execMail();
      logger.verbose("CRON: Full Scan Complete");
      this.checkOldRequests();
      await this.deleteOld();
    } else {
      logger.warn("CRON: Couldn't update libraries");
    }
  }

  async createAdmin() {
    let adminFound = await User.findOne({
      id: conf.get("admin.id"),
    });
    if (!adminFound) {
      logger.verbose("CRON: Creating admin user");
      try {
        let adminData = new User({
          id: conf.get("admin.id"),
          email: conf.get("admin.email"),
          thumb: conf.get("admin.thumbnail"),
          title: conf.get("admin.display"),
          nameLower: conf.get("admin.display").toLowerCase(),
          username: conf.get("admin.username"),
          password:
            conf.get("admin.password").substring(0, 3) === "$2a"
              ? conf.get("admin.password")
              : bcrypt.hashSync(conf.get("admin.password"), 10),
          altId: 1,
          role: "admin",
        });
        await adminData.save();
      } catch (err) {
        logger.error(`CRON: Error creating admin user`);
        logger.error(err);
      }
    } else {
      try {
        logger.verbose(`CRON: Admin Updating ${conf.get("admin.display")}`);
        adminFound.email = conf.get("admin.email");
        adminFound.thumb = conf.get("admin.thumbnail");
        adminFound.title = conf.get("admin.display");
        adminFound.nameLower = conf.get("admin.display").toLowerCase();
        adminFound.username = conf.get("admin.username");
        if (conf.get("admin.password").substring(0, 3) !== "$2a")
          adminFound.password = bcrypt.hashSync(conf.get("admin.password"), 10);
        await adminFound.save();
        logger.verbose(`CRON: Admin Updated ${conf.get("admin.display")}`);
      } catch (err) {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'obj'.
        logger.error(`CRON: Admin Update Failed ${obj.title}`);
        logger.error(err);
      }
    }
  }

  async getLibraries() {
    let url = `${conf.get("plex.protocol")}://${conf.get(
      "plex.host"
    )}:${conf.get("plex.port")}/library/sections/?X-Plex-Token=${conf.get(
      "plex.token"
    )}`;
    try {
      let res = await axios.get(url);
      logger.verbose("CRON: Found Libraries");
      return res.data.MediaContainer;
    } catch (e) {
      logger.warn("CRON: Library update failed!");
      throw e;
    }
  }

  async getRecent() {
    let url = `${conf.get("plex.protocol")}://${conf.get(
      "plex.host"
    )}:${conf.get("plex.port")}/library/recentlyAdded/?X-Plex-Token=${conf.get(
      "plex.token"
    )}`;
    try {
      let res = await axios.get(url);
      logger.verbose("CRON: Recently Added received");
      return res.data.MediaContainer;
    } catch {
      logger.warn("CRON: Recently added failed!");
      throw "Recently added failed";
    }
  }

  async saveLibraries(libraries) {
    await Promise.all(
      libraries.Directory.map(async (lib) => {
        await this.saveLibrary(lib);
      })
    );
  }

  async saveLibrary(lib) {
    let libraryItem: any = false;
    try {
      libraryItem = await Library.findOne({ uuid: lib.uuid });
    } catch {
      logger.verbose("CRON: Library Not found, attempting to create");
    }
    if (!libraryItem) {
      try {
        let newLibrary = new Library({
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
        libraryItem = await newLibrary.save();
      } catch (err) {
        logger.error(`CRON: Error`);
        logger.error(err);
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
          { useFindAndModify: false }
        );
      } catch (err) {
        logger.error(`CRON: Error`);
        logger.log(err);
      }
      if (updatedLibraryItem) {
        logger.log("verbose", "CRON: Library Updated " + lib.title);
      }
    }
  }

  async updateLibraryContent(libraries) {
    for (let l in libraries.Directory) {
      let lib = libraries.Directory[l];
      let music: any = [];
      try {
        let libContent = await this.getLibrary(lib.key);
        if (!libContent || !libContent.Metadata) {
          logger.warn(`CRON: No content in library skipping - ${lib.title}`);
          return;
        }
        await Promise.map(
          Object.keys(libContent.Metadata),
          async (item) => {
            let obj: any = libContent.Metadata[item];
            if (obj.type === "movie") {
              await this.saveMovie(obj);
            } else if (obj.type === "artist") {
              music.push(obj);
            } else if (obj.type === "show") {
              await this.saveShow(obj);
            } else {
              logger.verbose(`CRON: Unknown media type - ${obj.type}`);
            }
          },
          { concurrency: 10 }
        );
        for (let i in music) {
          let artist = music[i];
          await this.saveMusic(artist);
          await this.timeout(20);
        }
      } catch (err) {
        logger.error(`CRON: Unable to get library content`);
        logger.error(err);
        logger.error(err.stack);
      }
    }
  }

  async getLibrary(id) {
    let url = `${conf.get("plex.protocol")}://${conf.get(
      "plex.host"
    )}:${conf.get(
      "plex.port"
    )}/library/sections/${id}/all?X-Plex-Token=${conf.get("plex.token")}`;
    try {
      let res = await axios.get(url);
      return res.data.MediaContainer;
    } catch (e) {
      throw "Unable to get library content";
    }
  }

  async getMeta(id) {
    let url = `${conf.get("plex.protocol")}://${conf.get(
      "plex.host"
    )}:${conf.get(
      "plex.port"
    )}/library/metadata/${id}?includeChildren=1&X-Plex-Token=${conf.get(
      "plex.token"
    )}`;
    try {
      let res = await axios.get(url);
      return res.data.MediaContainer.Metadata[0];
    } catch (e) {
      throw "Unable to get meta";
    }
  }

  async getSeason(id) {
    let url = `${conf.get("plex.protocol")}://${conf.get(
      "plex.host"
    )}:${conf.get(
      "plex.port"
    )}/library/metadata/${id}/children?X-Plex-Token=${conf.get("plex.token")}`;
    try {
      let res = await axios.get(url);
      return res.data.MediaContainer.Metadata;
    } catch (e) {
      logger.log({ level: "error", message: e });
      throw "Unable to get meta";
    }
  }

  async saveMovie(movieObj) {
    let movieDb: any = false;
    let title = movieObj.title;
    let externalIds: any = {};
    let tmdbId = false;
    let externalId: any = false;
    let added = false;
    logger.verbose(`CRON: Movie Job: ${title}`);
    try {
      movieDb = await Movie.findOne({
        ratingKey: parseInt(movieObj.ratingKey),
      });
    } catch {
      movieDb = false;
    }
    let idSource = movieObj.guid
      .replace("com.plexapp.agents.", "")
      .split("://")[0];
    if (idSource === "local" || idSource === "none") {
      logger.verbose(
        `CRON: Item skipped :: Not matched / local only - ${title}`
      );
      return;
    }
    try {
      movieObj = await this.getMeta(movieObj.ratingKey);
    } catch {
      logger.warn(`CRON: Unable to fetch meta for ${title}`);
      return;
    }
    if (idSource === "plex") {
      try {
        if (!Array.isArray(movieObj.Guid)) {
          logger.warn(
            `CRON: Movie couldn't be matched - ${title} - try rematching in Plex`
          );
          return;
        }
        for (let guid of movieObj.Guid) {
          if (!guid.id) {
            logger.warn(
              `CRON: Movie couldn't be matched - ${title} - no GUID ID`
            );
            return;
          }
          let source = guid.id.split("://");
          externalIds[source[0] + "_id"] = source[1];
          if (source[0] === "tmdb") tmdbId = source[1];
        }

        if (!externalIds["tmdb_id"]) {
          const type = Object.keys(externalIds)[0].replace("_id", "");
          try {
            tmdbId = await this.externalIdMovie(
              externalIds[Object.keys(externalIds)[0]].replace("/", ""),
              type
            );
            logger.verbose(
              `CRON: Got external ID - ${title} - using agent ${type} : ${tmdbId}`
            );
          } catch {
            tmdbId = false;
            logger.verbose(
              `CRON: Couldn't get external ID - ${title} - using agent ${type}`
            );
          }
        }
      } catch (e) {
        logger.log(e);
        logger.warn(
          `CRON: Movie couldn't be matched - ${title} - try rematching in Plex`
        );
        return;
      }
    } else {
      if (idSource === "themoviedb") {
        idSource = "tmdb";
      }

      try {
        externalId = movieObj.guid
          .replace("com.plexapp.agents.", "")
          .split("://")[1]
          .split("?")[0];
      } catch (e) {
        logger.warn(
          `CRON: Movie couldn't be matched - ${title} - GUID Error #2 - GUID is - ${movieObj.guid}`
        );
        return;
      }

      if (idSource !== "tmdb") {
        try {
          tmdbId = await this.externalIdMovie(externalId, idSource);
          logger.verbose(
            `CRON: Got external ID - ${title} - using agent ${idSource} : ${tmdbId}`
          );
        } catch {
          logger.verbose(
            `CRON: Couldn't get external ID - ${title} - using agent ${idSource}`
          );
          tmdbId = false;
        }
      }
    }
    if (idSource !== "tmdb" && !tmdbId) {
      logger.warn(
        `CRON: Movie couldn't be matched - ${title} - try rematching in Plex`
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
    movieDb.imdb_id = externalIds.hasOwnProperty("imdb_id")
      ? externalIds.imdb_id
      : false;
    movieDb.tmdb_id = idSource === "tmdb" ? externalId : tmdbId;

    if (this.timestamp) {
      movieDb.petioTimestamp = this.timestamp;
    }

    try {
      await movieDb.save();
      if (added) {
        await this.mailAdded(movieObj, movieDb.tmdb_id);
        logger.verbose(`CRON: Movie Added - ${movieObj.title}`);
      }
    } catch (err) {
      logger.error(`CRON: Failed to save ${title} to Db`);
      logger.log(err);
    }
  }

  async saveMusic(musicObj) {
    let musicDb: any = false;
    let title = musicObj.title;
    let added = false;
    let match: any = false;
    logger.verbose(`CRON: Music Job: ${title}`);
    try {
      musicDb = await Music.findOne({
        ratingKey: parseInt(musicObj.ratingKey),
      });
    } catch {
      musicDb = false;
    }
    if (musicDb && musicDb.metaId) {
      match = { id: musicDb.metaId, name: musicDb.metaTitle };
    }
    if (match && musicDb.metaId === "no genres" && musicObj.Genre) {
      logger.verbose(
        `CRON: Music - "${title}" Now has genres, attempting to match`
      );
      match = false;
    }
    if (!match) {
      match = await new MusicMeta().match(musicObj.title, musicObj.Genre);
    }
    if (!musicDb) {
      added = true;
      musicDb = new Music({
        ratingKey: musicObj.ratingKey,
      });
    }
    musicDb.title = musicObj.title;
    musicDb.metaId = match ? match.id : false;
    musicDb.metaTitle = match ? match.name : false;
    try {
      await musicDb.save();
      if (added) {
        await this.mailAdded(musicObj, musicDb.metaId);
        logger.verbose(`CRON: Music Added - ${musicObj.title}`);
      }
    } catch (err) {
      logger.error(`CRON: Failed to save ${title} to Db`);
      logger.error(err);
    }
  }

  async saveShow(showObj) {
    let showDb: any = false;
    let title = showObj.title;
    let externalIds: any = {};
    let tmdbId = false;
    let externalId = false;
    let added = false;
    let seasons = [];
    logger.verbose(`CRON: TV Job: ${title}`);
    try {
      showDb = await Show.findOne({ ratingKey: parseInt(showObj.ratingKey) });
    } catch {
      showDb = false;
    }
    let idSource = showObj.guid
      .replace("com.plexapp.agents.", "")
      .split("://")[0];
    if (idSource === "local" || idSource === "none") {
      logger.verbose(
        `CRON: Item skipped :: Not matched / local only - ${title}`
      );
      return;
    }
    try {
      showObj = await this.getMeta(showObj.ratingKey);
      seasons = await Promise.map(
        showObj.Children.Metadata,
        async (season) => {
          let seasonData = await this.getSeason(season.ratingKey);
          let thisSeason = {
            seasonNumber: season.index,
            title: season.title,
            episodes: {},
          };
          for (let e in seasonData) {
            let ep = seasonData[e];
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
        { concurrency: 2 }
      );
    } catch (e) {
      logger.warn(`CRON: Unable to fetch meta for ${title}`);
      logger.error(e);
      return;
    }
    if (idSource === "plex") {
      try {
        if (!Array.isArray(showObj.Guid)) {
          logger.warn(
            `CRON: Show couldn't be matched - ${title} - try rematching in Plex`
          );
          return;
        }
        for (let guid of showObj.Guid) {
          if (!guid.id) {
            logger.warn(
              `CRON: Show couldn't be matched - ${title} - no GUID ID`
            );
            return;
          }
          let source = guid.id.split("://");
          externalIds[source[0] + "_id"] = source[1];
          if (source[0] === "tmdb") tmdbId = source[1];
        }
      } catch (e) {
        logger.warn(
          `CRON: Show couldn't be matched - ${title} - try rematching in Plex`
        );
        logger.error(e);
        return;
      }
    } else {
      if (idSource === "thetvdb") {
        idSource = "tvdb";
      }
      if (idSource === "themoviedb") {
        idSource = "tmdb";
      }
      externalId = showObj.guid
        .replace("com.plexapp.agents.", "")
        .split("://")[1]
        .split("?")[0];

      if (idSource !== "tmdb") {
        try {
          tmdbId = await this.externalIdTv(externalId, idSource);
        } catch {
          tmdbId = false;
        }
      } else {
        try {
          externalIds = await this.tmdbExternalIds(externalId);
        } catch (err) {
          logger.log({ level: "warn", message: err });
        }
      }
    }
    if (idSource !== "tmdb" && !tmdbId) {
      logger.warn(
        `CRON: Show couldn't be matched - ${title} - try rematching in Plex`
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
    showDb.imdb_id = idSource === "imdb" ? externalId : externalIds.imdb_id;
    showDb.tvdb_id = idSource === "tvdb" ? externalId : externalIds.tvdb_id;
    showDb.tmdb_id = idSource === "tmdb" ? externalId : tmdbId;
    showDb.seasonData = {};
    for (let s in seasons) {
      let season: any = seasons[s];
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
        logger.verbose(`CRON: Show Added - ${showObj.title}`);
      }
    } catch (err) {
      logger.error(`CRON: Failed to save ${title} to Db`);
      logger.error(err);
    }
  }

  async updateFriends() {
    logger.verbose("CRON: Updating Friends");
    let friendList = false;
    try {
      friendList = await this.getFriends();
    } catch (err) {
      logger.error(`CRON: Error getting friend list`);
      logger.error(err);
    }
    if (friendList) {
      await Promise.all(
        Object.keys(friendList).map(async (item) => {
          await this.saveFriend(friendList[item].attributes);
        })
      );
    }
  }

  async getFriends() {
    let url = `https://plex.tv/pms/friends/all?X-Plex-Token=${conf.get(
      "plex.token"
    )}`;
    try {
      let res = await axios.get(url);
      let dataParse = JSON.parse(
        xmlParser.xml2json(res.data, { compact: false })
      );
      return dataParse.elements[0].elements;
    } catch (e) {
      logger.error("CRON: Unable to get friends");
      logger.error(e);
      throw "Unable to get friends";
    }
  }

  async saveFriend(obj) {
    // Maybe delete all and rebuild each time?
    let friendDb: any = false;
    try {
      friendDb = await User.findOne({ id: obj.id });
    } catch {
      friendDb = false;
    }

    if (!friendDb) {
      try {
        let defaultProfile = await Profile.findOne({ isDefault: true });
        let newFriend = new User({
          id: obj.id,
          title: obj.title,
          username: obj.username ? obj.username : obj.title,
          nameLower: obj.username
            ? obj.username.toLowerCase()
            : obj.title.toLowerCase(),
          email: obj.email.toLowerCase(),
          recommendationsPlaylistId: obj.recommendationsPlaylistId,
          thumb: obj.thumb,
          Server: obj.Server,
          quotaCount: 0,
        });
        if (defaultProfile) {
          newFriend.profile = defaultProfile._id;
        }
        friendDb = await newFriend.save();
      } catch (err) {
        logger.error(`CRON: Error`);
        logger.error(err);
      }
      if (friendDb) {
        logger.verbose(`CRON: User Created ${obj.title}`);
      } else {
        logger.warn(`CRON: User Failed to Create ${obj.title}`);
      }
    }
  }

  async mailAdded(plexData, ref_id) {
    let request = await Request.findOne({ tmdb_id: ref_id });
    if (request) {
      await Promise.all(
        request.users.map(async (user, i) => {
          await this.sendMail(user, i, request);
        })
      );
      await new processRequest(request).archive(true, false);
    }
  }

  async sendMail(user, i, request) {
    let userData = await User.findOne({ id: user });
    if (!userData) {
      logger.error("CRON: Err: No user data");
      return;
    }
    this.discordNotify(userData, request);
    if (!userData.email) {
      logger.warn("CRON: Err: User has no email");
      return;
    }

    this.mailer.push([
      `${request.title} added to Plex!`,
      `${request.title} added to Plex!`,
      "Your request has now been processed and is ready to watch on Plex, thanks for your request!",
      `https://image.tmdb.org/t/p/w500${request.thumb}`,
      [userData.email],
      [userData.title],
    ]);

    logger.verbose(`CRON: Mailer updated`);
  }

  discordNotify(user, request) {
    let type = request.type === "tv" ? "TV Show" : "Movie";
    const title: any = `${request.title} added to Plex!`;
    const subtitle: any = `The ${type} "${request.title}" has been processed and is now available to watch on Plex"`;
    const image: any = `https://image.tmdb.org/t/p/w500${request.thumb}`;
    [new Discord(), new Telegram()].forEach((notification) =>
      notification.send(
        title,
        subtitle,
        user.title,
        image,
      )
    );
  }

  execMail() {
    logger.verbose("MAILER: Parsing mail queue");
    this.mailer.forEach((mail, index) => {
      setTimeout(() => {
        new Mailer().mail(mail[0], mail[1], mail[2], mail[3], mail[4], mail[5]);
      }, 10000 * (index + 1));
    });
    this.mailer = [];
  }

  async externalIdTv(id, type) {
    let url = `${this.tmdb}find/${id}?api_key=${tmdbApiKey}&language=en-US&external_source=${type}_id`;
    try {
      let res = await axios.get(url);
      return res.data.tv_results[0].id;
    } catch (e) {
      throw e;
    }
  }

  async tmdbExternalIds(id) {
    let url = `${this.tmdb}tv/${id}/external_ids?api_key=${tmdbApiKey}`;
    try {
      let res = await axios.get(url);
      return res.data;
    } catch (e) {
      throw e;
    }
  }

  async externalIdMovie(id, type) {
    let url = `${this.tmdb}find/${id}?api_key=${tmdbApiKey}&language=en-US&external_source=${type}_id`;
    try {
      let res = await axios.get(url);
      return res.data.movie_results[0].id;
    } catch (e) {
      throw e;
    }
  }

  async checkOldRequests() {
    logger.verbose("CRON: Checking old requests");
    let requests = await Request.find();
    for (let i = 0; i < requests.length; i++) {
      let onServer: any = false;
      let request = requests[i];
      if (request.type === "tv") {
        onServer = await Show.findOne({ tmdb_id: request.tmdb_id });
        if (!request.tvdb_id) {
          logger.verbose(
            `CRON: No TVDB ID for request: ${request.title}, attempting to pull meta`
          );
          let lookup = await showLookup(request.tmdb_id, true);
          request.thumb = lookup.poster_path;
          request.tvdb_id = lookup.tvdb_id;
          try {
            await request.save();
            logger.verbose(
              `CRON: Meta updated for request: ${request.title}, processing request with updated meta`
            );
            if (request.tvdb_id)
              new processRequest({
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
              `CRON: Failed to update meta for request: ${request.title}`
            );
          }
        }
      }
      if (request.type === "movie") {
        onServer = await Movie.findOne({ tmdb_id: request.tmdb_id });
      }

      if (onServer) {
        logger.verbose(`CRON: Found missed request - ${request.title}`);
        new processRequest(request, false).archive(true, false, false);
        let emails: any = [];
        let titles: any = [];
        await Promise.all(
          request.users.map(async (user) => {
            let userData = await User.findOne({ id: user });
            if (!userData) return;
            emails.push(userData.email);
            titles.push(userData.title);
          })
        );
        new Mailer().mail(
          `${request.title} added to Plex!`,
          `${request.title} added to Plex!`,
          "Your request has now been processed and is ready to watch on Plex, thanks for your request!",
          `https://image.tmdb.org/t/p/w500${request.thumb}`,
          emails,
          titles
        );
      }
    }
  }

  async deleteOld() {
    const deleteMovies = await Movie.find({
      petioTimestamp: { $ne: this.timestamp },
    });
    for (let i in deleteMovies) {
      let deleteMovie = deleteMovies[i];
      logger.warn(
        `CRON: Deleting Movie - ${deleteMovie.title} - no longer found in Plex`
      );
      await Movie.findOneAndRemove(
        { _id: deleteMovie._id },
        { useFindAndModify: false }
      );
    }
    const deleteShows = await Show.find({
      petioTimestamp: { $ne: this.timestamp },
    });
    for (let i in deleteShows) {
      let deleteShow = deleteShows[i];
      logger.warn(
        `CRON: Deleting TV Show - ${deleteShow.title} - no longer found in Plex`
      );
      await Show.findOneAndRemove(
        { _id: deleteShow._id },
        { useFindAndModify: false }
      );
    }
  }
}