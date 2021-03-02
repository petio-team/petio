const request = require("xhr-request");
const xmlParser = require("xml-js");
const Library = require("../models/library");
const Movie = require("../models/movie");
const Music = require("../models/artist");
const Show = require("../models/show");
const User = require("../models/user");
const Request = require("../models/request");
const Profile = require("../models/profile");
const Mailer = require("../mail/mailer");
const getConfig = require("../util/config");
const processRequest = require("../requests/process");
const logger = require("../util/logger");
const bcrypt = require("bcryptjs");

class LibraryUpdate {
  constructor() {
    this.config = getConfig();
    this.mailer = [];
    this.tmdb = "https://api.themoviedb.org/3/";
    this.full = true;
  }

  run() {
    this.scan();
  }

  async partial() {
    logger.log("info", `LIB CRON: Running Partial`);
    this.full = false;
    let recent = false;
    try {
      await this.updateFriends();
      recent = await this.getRecent();
    } catch (err) {
      logger.log(
        "warn",
        `LIB CRON: Partial scan failed - unable to get recent`
      );
      logger.log({ level: "error", message: err });
      return;
    }
    let matched = {};

    await Promise.all(
      Object.keys(recent.Metadata).map(async (i) => {
        let obj = recent.Metadata[i];

        if (obj.type === "movie") {
          if (!matched[obj.ratingKey]) {
            matched[obj.ratingKey] = true;
            await this.saveMovie(obj);
            logger.log("info", `LIB CRON: Partial scan - ${obj.title}`);
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
            logger.log("info", `LIB CRON: Partial scan - ${obj.title}`);
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
            logger.log(
              "info",
              `LIB CRON: Partial scan - ${parent.title} - Built from series`
            );
          }
        } else {
          logger.log(
            "warn",
            `LIB CRON: Partial scan type not found - ${obj.type}`
          );
        }
      })
    );
    this.execMail();
    logger.log("info", "LIB CRON: Partial Scan Complete");
  }

  async scan() {
    logger.log("info", `LIB CRON: Running Full`);
    await this.createAdmin();
    let libraries = false;
    try {
      libraries = await this.getLibraries();
    } catch (err) {
      logger.log("error", `LIB CRON: Error`);
      logger.log({ level: "error", message: err });
    }

    if (libraries) {
      await this.saveLibraries(libraries);
      await this.updateLibraryContent(libraries);
      await this.updateFriends();
      this.execMail();
      logger.log("info", "LIB CRON: Full Scan Complete");
      this.checkOldRequests();
    } else {
      logger.log("warn", "Couldn't update libraries");
    }
  }

  async createAdmin() {
    let adminFound = await User.findOne({
      id: this.config.adminId,
    });
    if (!adminFound) {
      logger.log("info", "LIB CRON: Creating admin user");
      try {
        let adminData = new User({
          id: this.config.adminId,
          email: this.config.adminEmail,
          thumb: this.config.adminThumb,
          title: this.config.adminDisplayName,
          username: this.config.adminUsername,
          password: bcrypt.hashSync(this.config.adminPass, 10),
          altId: 1,
          role: "admin",
        });
        await adminData.save();
      } catch (err) {
        logger.log("error", `LIB CRON: Error creating admin user`);
        logger.log({ level: "error", message: err });
      }
    }
  }

  getLibraries() {
    return new Promise((resolve, reject) => {
      let url = `${this.config.plexProtocol}://${this.config.plexIp}:${this.config.plexPort}/library/sections/?X-Plex-Token=${this.config.plexToken}`;
      request(
        url,
        {
          method: "GET",
          json: true,
        },
        function (err, data) {
          if (err || !data) {
            logger.log("warn", "LIB CRON: Library update failed!");
            reject("Unable to get library info");
          }
          if (data) {
            logger.log("info", "LIB CRON: Found Libraries");
            resolve(data.MediaContainer);
          } else {
            logger.log("warn", "LIB CRON: Library update failed!");
            reject("Unable to get library info");
          }
        }
      );
    });
  }

  getRecent() {
    return new Promise((resolve, reject) => {
      let url = `${this.config.plexProtocol}://${this.config.plexIp}:${this.config.plexPort}/library/recentlyAdded/?X-Plex-Token=${this.config.plexToken}`;
      request(
        url,
        {
          method: "GET",
          json: true,
        },
        function (err, data) {
          if (err || !data) {
            logger.log("warn", "LIB CRON: Recently added failed!");
            reject();
          }
          if (data) {
            logger.log("info", "LIB CRON: Recently Added received");
            resolve(data.MediaContainer);
          } else {
            logger.log("warn", "LIB CRON: Recently added failed!");
            reject();
          }
        }
      );
    });
  }

  async saveLibraries(libraries) {
    await Promise.all(
      libraries.Directory.map(async (lib) => {
        await this.saveLibrary(lib);
      })
    );
  }

  async saveLibrary(lib) {
    let libraryItem = false;
    try {
      libraryItem = await Library.findOne({ uuid: lib.uuid });
    } catch {
      logger.log("info", "LIB CRON: Library Not found, attempting to create");
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
        logger.log("error", `LIB CRON: Error`);
        logger.log({ level: "error", message: err });
      }
    } else {
      let updatedLibraryItem = false;
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
        logger.log("error", `LIB CRON: Error`);
        logger.log({ level: "error", message: err });
      }
      if (updatedLibraryItem) {
        logger.log("info", "LIB CRON: Library Updated " + lib.title);
      }
    }
  }

  async updateLibraryContent(libraries) {
    await Promise.all(
      libraries.Directory.map(async (lib) => {
        try {
          let libContent = await this.getLibrary(lib.key);
          await Promise.all(
            Object.keys(libContent.Metadata).map(async (item) => {
              let obj = libContent.Metadata[item];
              if (obj.type === "movie") {
                await this.saveMovie(obj);
              } else if (obj.type === "artist") {
                await this.saveMusic(obj);
              } else if (obj.type === "show") {
                await this.saveShow(obj);
              } else {
                logger.log(
                  "info",
                  `LIB CRON: Unknown media type - ${obj.type}`
                );
              }
            })
          );
        } catch (err) {
          logger.log("error", `LIB CRON: Unable to get library content`);
          logger.log({ level: "error", message: err });
        }
      })
    );
  }

  getLibrary(id) {
    let url = `${this.config.plexProtocol}://${this.config.plexIp}:${this.config.plexPort}/library/sections/${id}/all?X-Plex-Token=${this.config.plexToken}`;
    return new Promise((resolve, reject) => {
      request(
        url,
        {
          method: "GET",
          json: true,
        },
        function (err, data) {
          if (err || !data) {
            reject("Unable to get library content");
          }
          if (data) {
            resolve(data.MediaContainer);
          } else {
            reject("Unable to get library content");
          }
        }
      );
    });
  }

  getMeta(id) {
    let url = `${this.config.plexProtocol}://${this.config.plexIp}:${this.config.plexPort}/library/metadata/${id}?X-Plex-Token=${this.config.plexToken}`;
    return new Promise((resolve, reject) => {
      request(
        url,
        {
          method: "GET",
          json: true,
        },
        function (err, data) {
          if (err || !data) {
            reject("Unable to get meta");
          }
          if (data) {
            resolve(data.MediaContainer.Metadata[0]);
          } else {
            reject("Unable to get meta");
          }
        }
      );
    });
  }

  async saveMovie(movieObj) {
    let movieDb = false;
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
    let externalId = false;
    let externalIds = {};
    if (idSource === "local") return;
    if (idSource === "plex") {
      let title = movieObj.title;
      try {
        movieObj = await this.getMeta(movieObj.ratingKey);
        for (let guid of movieObj.Guid) {
          let source = guid.id.split("://");
          externalIds[source[0] + "_id"] = source[1];
        }
      } catch (err) {
        logger.log("warn", `LIB CRON: Unable to fetch meta for ${title}`);
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

        externalIds = await this.externalIdMovie(externalId);
        externalIds.tmdb_id = externalIds.id ? externalIds.id : false;
      } catch (err) {
        if (!externalId) {
          logger.log(
            "warn",
            `LIB CRON: Error - unable to parse id source from: ${movieObj.guid} - Movie: ${movieObj.title}`
          );
        } else {
          logger.log({ level: "error", message: err });
        }
      }
    }

    if (!movieDb) {
      try {
        let newMovie = new Movie({
          title: movieObj.title,
          ratingKey: movieObj.ratingKey,
          key: movieObj.key,
          guid: movieObj.guid,
          studio: movieObj.studio,
          type: movieObj.type,
          titleSort: movieObj.titleSort,
          contentRating: movieObj.contentRating,
          summary: movieObj.summary,
          rating: movieObj.rating,
          year: movieObj.year,
          tagline: movieObj.tagline,
          thumb: movieObj.thumb,
          art: movieObj.art,
          duration: movieObj.duration,
          originallyAvailableAt: movieObj.originallyAvailableAt,
          addedAt: movieObj.addedAt,
          updatedAt: movieObj.updatedAt,
          primaryExtraKey: movieObj.primaryExtraKey,
          ratingImage: movieObj.ratingImage,
          Media: movieObj.Media,
          Genre: movieObj.Genre,
          Director: movieObj.Director,
          Writer: movieObj.Writer,
          Country: movieObj.Country,
          Role: movieObj.Role,
          idSource: idSource,
          externalId: externalId,
          imdb_id: externalIds.hasOwnProperty("imdb_id")
            ? externalIds.imdb_id
            : false,
          tmdb_id: externalIds.hasOwnProperty("tmdb_id")
            ? externalIds.tmdb_id
            : false,
        });
        movieDb = await newMovie.save();
        await this.mailAdded(movieObj, externalId);
        logger.log("info", `LIB CRON: Movie Added - ${movieObj.title}`);
      } catch (err) {
        logger.log("warn", `LIB CRON: Error`);
        logger.log({ level: "error", message: err });
      }
    } else {
      try {
        await Movie.findOneAndUpdate(
          {
            ratingKey: movieObj.ratingKey,
          },
          {
            $set: {
              title: movieObj.title,
              ratingKey: movieObj.ratingKey,
              key: movieObj.key,
              guid: movieObj.guid,
              studio: movieObj.studio,
              type: movieObj.type,
              titleSort: movieObj.titleSort,
              contentRating: movieObj.contentRating,
              summary: movieObj.summary,
              rating: movieObj.rating,
              year: movieObj.year,
              tagline: movieObj.tagline,
              thumb: movieObj.thumb,
              art: movieObj.art,
              duration: movieObj.duration,
              originallyAvailableAt: movieObj.originallyAvailableAt,
              addedAt: movieObj.addedAt,
              updatedAt: movieObj.updatedAt,
              primaryExtraKey: movieObj.primaryExtraKey,
              ratingImage: movieObj.ratingImage,
              Media: movieObj.Media,
              Genre: movieObj.Genre,
              Director: movieObj.Director,
              Writer: movieObj.Writer,
              Country: movieObj.Country,
              Role: movieObj.Role,
              idSource: idSource,
              externalId: externalId,
              imdb_id: externalIds.hasOwnProperty("imdb_id")
                ? externalIds.imdb_id
                : false,
              tmdb_id: externalIds.hasOwnProperty("tmdb_id")
                ? externalIds.tmdb_id
                : false,
            },
          },
          { useFindAndModify: false }
        );
      } catch (err) {
        movieDb = false;
        logger.log("warn", err);
      }
    }
  }

  async saveMusic(musicObj) {
    let musicDb = false;
    try {
      musicDb = await Music.findOne({
        ratingKey: parseInt(musicObj.ratingKey),
      });
      if (!this.full && musicDb) {
        return;
      }
    } catch {
      musicDb = false;
    }
    if (!musicDb) {
      try {
        let newMusic = new Music({
          title: musicObj.title,
          ratingKey: musicObj.ratingKey,
          key: musicObj.key,
          guid: musicObj.guid,
          type: musicObj.type,
          summary: musicObj.summary,
          index: musicObj.index,
          thumb: musicObj.thumb,
          addedAt: musicObj.addedAt,
          updatedAt: musicObj.updatedAt,
          Genre: musicObj.Genre,
          Country: musicObj.Country,
        });
        musicDb = await newMusic.save();
      } catch (err) {
        logger.log("error", `LIB CRON: Error`);
        logger.log({ level: "error", message: err });
      }
    }
  }

  async saveShow(showObj) {
    let showDb = false;

    try {
      showDb = await Show.findOne({ ratingKey: parseInt(showObj.ratingKey) });
    } catch {
      showDb = false;
    }

    let idSource = showObj.guid
      .replace("com.plexapp.agents.", "")
      .split("://")[0];
    let externalIds = {};
    let tmdbId = false;
    let externalId = false;
    if (idSource === "local") return;
    if (idSource === "plex") {
      let title = showObj.title;
      try {
        showObj = await this.getMeta(showObj.ratingKey);
        for (let guid of showObj.Guid) {
          let source = guid.id.split("://");
          externalIds[source[0] + "_id"] = source[1];
          if (source[0] === "tmdb") tmdbId = source[1];
        }
      } catch (err) {
        logger.log("warn", `LIB CRON: Unable to fetch meta for ${title}`);
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
          logger.log("warn", err);
        }
      }
    }

    if (!showDb) {
      try {
        let newShow = new Show({
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
          updatedAt: showObj.updatedAt,
          Genre: showObj.Genre,
          idSource: idSource,
          externalId: externalId,
          imdb_id: idSource === "imdb" ? externalId : externalIds.imdb_id,
          tvdb_id: idSource === "tvdb" ? externalId : externalIds.tvdb_id,
          tmdb_id: idSource === "tmdb" ? externalId : tmdbId,
        });
        showDb = await newShow.save();
        await this.mailAdded(showObj, externalId);
        logger.log("info", `LIB CRON: Show Added - ${showObj.title}`);
      } catch (err) {
        logger.log("error", `LIB CRON: Error`);
        logger.log({ level: "error", message: err });
      }
    } else {
      try {
        await Show.findOneAndUpdate(
          {
            ratingKey: showObj.ratingKey,
          },
          {
            $set: {
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
              updatedAt: showObj.updatedAt,
              Genre: showObj.Genre,
              idSource: idSource,
              externalId: externalId,
              imdb_id: idSource === "imdb" ? externalId : externalIds.imdb_id,
              tvdb_id: idSource === "tvdb" ? externalId : externalIds.tvdb_id,
              tmdb_id: idSource === "tmdb" ? externalId : tmdbId,
            },
          },
          { useFindAndModify: false }
        );
      } catch {
        showDb = false;
      }
    }
  }

  async updateFriends() {
    let friendList = false;
    try {
      friendList = await this.getFriends();
    } catch (err) {
      logger.log("error", `LIB CRON: Error getting friend list`);
      logger.log({ level: "error", message: err });
    }
    if (friendList) {
      Object.keys(friendList).map((item) => {
        this.saveFriend(friendList[item].attributes);
      });
    }
  }

  getFriends() {
    let url = `https://plex.tv/pms/friends/all?X-Plex-Token=${this.config.plexToken}`;
    return new Promise((resolve, reject) => {
      request(
        url,
        {
          method: "GET",
          // json: true,
        },
        function (err, data) {
          if (err) {
            reject("Unable to get friends");
            logger.log("error", "LIB CRON: Unable to get friends");
            logger.log("error", `LIB CRON: Error`);
            logger.log({ level: "error", message: err });
          }
          if (!data) {
            reject("no data");
          } else {
            let dataParse = JSON.parse(
              xmlParser.xml2json(data, { compact: false })
            );

            if (dataParse.elements[0]) {
              resolve(dataParse.elements[0].elements);
            } else {
              reject("No User object returned");
            }
          }
        }
      );
    });
  }

  async saveFriend(obj) {
    // Maybe delete all and rebuild each time?
    let friendDb = false;
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
          email: obj.email,
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
        logger.log("error", `LIB CRON: Error`);
        logger.log({ level: "error", message: err });
      }
      if (friendDb) {
        logger.log("info", `LIB CRON: User Created ${obj.title}`);
      } else {
        logger.log("warn", `LIB CRON: User Failed to Create ${obj.title}`);
      }
    }
  }

  async mailAdded(plexData, ref_id) {
    let request = await Request.findOne({
      $or: [{ imdb_id: ref_id }, { tmdb_id: ref_id }, { tvdb_id: ref_id }],
    });
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
      logger.log("error", "LIB CRON: Err: No user data");
      return;
    }
    if (!userData.email) {
      logger.log("warn", "LIB CRON: Err: User has no email");
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

    logger.log("info", `LIB CRON: Mailer updated`);
  }

  execMail() {
    logger.log("info", "MAILER: Parsing mail queue");
    this.mailer.forEach((mail, index) => {
      setTimeout(() => {
        new Mailer().mail(mail[0], mail[1], mail[2], mail[3], mail[4], mail[5]);
      }, 10000 * (index + 1));
    });
    this.mailer = [];
  }

  externalIdTv(id, type) {
    let url = `${this.tmdb}find/${id}?api_key=${this.config.tmdbApi}&language=en-US&external_source=${type}_id`;
    return new Promise((resolve, reject) => {
      request(
        url,
        {
          method: "GET",
          json: true,
        },
        function (err, data) {
          if (err) {
            reject(err);
          }
          if (!data || !data.tv_results) {
            reject("Error no data returned from tmdb TV external");
          } else if (data.tv_results.length === 0) {
            reject();
          } else {
            resolve(data.tv_results[0].id);
          }
        }
      );
    });
  }

  tmdbExternalIds(id) {
    let url = `${this.tmdb}tv/${id}/external_ids?api_key=${this.config.tmdbApi}`;
    return new Promise((resolve, reject) => {
      request(
        url,
        {
          method: "GET",
          json: true,
        },
        function (err, data) {
          if (err) {
            reject(err);
          }
          resolve(data);
        }
      );
    });
  }

  externalIdMovie(id) {
    let url = `${this.tmdb}movie/${id}/external_ids?api_key=${this.config.tmdbApi}`;
    return new Promise((resolve, reject) => {
      request(
        url,
        {
          method: "GET",
          json: true,
        },
        function (err, data) {
          if (err) {
            reject(err);
          }
          resolve(data);
        }
      );
    });
  }

  async checkOldRequests() {
    logger.info("LIB CRON: Checking old requests");
    let requests = await Request.find();
    for (let i = 0; i < requests.length; i++) {
      let onServer = false;
      let request = requests[i];
      if (request.type === "tv") {
        onServer = await Show.findOne({ tmdb_id: request.tmdb_id });
      }
      if (request.type === "movie") {
        onServer = await Movie.findOne({ tmdb_id: request.tmdb_id });
      }

      if (onServer) {
        logger.verbose(`LIB CRON: Found missed request - ${request.title}`);
        new processRequest(request, false).archive(true, false, false);
        let emails = [];
        let titles = [];
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
}

module.exports = LibraryUpdate;
