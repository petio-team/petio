const Request = require("../models/request");
const Archive = require("../models/archive");
const User = require("../models/user");
const Profile = require("../models/profile");
const Mailer = require("../mail/mailer");
const Sonarr = require("../services/sonarr");
const Radarr = require("../services/radarr");
const logger = require("../util/logger");
const filter = require("./filter");
const Discord = require("../notifications/discord");
const Telegram = require("../notifications/telegram");
const { showLookup } = require("../tmdb/show");
const fs = require("fs");
const path = require("path");

class processRequest {
  constructor(req = {}, usr = {}) {
    this.request = req;
    this.user = usr;
  }
  async new() {
    let out = {};
    let quotaPass = await this.checkQuota();
    if (quotaPass) {
      try {
        let existing = await Request.findOne({
          requestId: this.request.id,
        });
        if (existing) {
          out = await this.existing();
        } else {
          out = await this.create();
        }
        if (quotaPass !== "admin") {
          let updatedUser = await User.findOneAndUpdate(
            { id: this.user.id },
            { $inc: { quotaCount: 1 } },
            { new: true, useFindAndModify: false }
          );
          out.quota = updatedUser.quotaCount;
        }
        this.mailRequest();
        this.discordNotify();
      } catch (err) {
        logger.log("error", "REQ: Error");
        logger.log({ level: "error", message: err });
        out = {
          message: "failed",
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

  async existing() {
    let userDetails = await User.findOne({ id: this.user.id });
    let profile = userDetails.profile
      ? await Profile.findById(this.user.profile)
      : false;
    let autoApprove = profile ? profile.autoApprove : false;
    let autoApproveTv = profile ? profile.autoApproveTv : false;
    if (userDetails.role === "admin") {
      autoApprove = true;
      autoApproveTv = true;
    }
    let requestDb = await Request.findOne({ requestId: this.request.id });
    if (!requestDb.users.includes(this.user.id)) {
      requestDb.users.push(this.user.id);
      requestDb.markModified("users");
    }
    if (this.request.type === "tv") {
      let existingSeasons = requestDb.seasons || {};
      Object.keys(this.request.seasons).map((key) => {
        existingSeasons[key] = true;
      });
      requestDb.seasons = existingSeasons;
      this.request.seasons = existingSeasons;
      console.log(existingSeasons);
      requestDb.markModified("seasons");
    }
    await requestDb.save();
    if (
      (this.request.type === "movie" && autoApprove) ||
      (this.request.type === "tv" && autoApproveTv)
    ) {
      requestDb.approved = true;
      await requestDb.save();
      this.sendToDvr(profile);
    }
    return {
      message: "request updated",
      user: this.user.title,
      request: this.request,
    };
  }

  async create() {
    let userDetails = await User.findOne({ id: this.user.id });
    let profile = userDetails.profile
      ? await Profile.findById(this.user.profile)
      : false;
    let autoApprove = profile
      ? this.request.type === "movie"
        ? profile.autoApprove
        : profile.autoApproveTv
      : false;

    if (userDetails.role === "admin") {
      autoApprove = true;
    }

    if (this.request.type === "tv" && !this.request.tvdb_id) {
      let lookup = await showLookup(this.request.id, true);
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
    });

    if (this.request.type === "tv") {
      newRequest.seasons = this.request.seasons;
    }

    try {
      await newRequest.save();
      if (autoApprove) {
        this.sendToDvr(profile);
      } else {
        logger.info("REQ: Request requires approval, waiting");
        this.pendingDefaults(profile);
      }
    } catch (err) {
      logger.log("error", `REQ: Unable to save request`);
      logger.log({ level: "error", message: err });
      return {
        message: "failed",
        error: true,
        user: this.user,
        request: this.request,
      };
    }

    return {
      message: "request added",
      user: this.user.title,
      request: this.request,
    };
  }

  async pendingDefaults(profile) {
    let pending = {};
    let filterMatch = await filter(this.request);
    if (filterMatch) {
      logger.log(
        "info",
        "REQ: Pending Request Matched on custom filter, setting default"
      );
      pending[filterMatch.server] = {
        path: filterMatch.path,
        profile: filterMatch.profile,
        tag: filterMatch.tag,
      };
    } else {
      let project_folder, configFile, configData, configParse;
      if (this.request.type === "movie") {
        if (process.pkg) {
          project_folder = path.dirname(process.execPath);
          configFile = path.join(project_folder, "./config/radarr.json");
        } else {
          project_folder = __dirname;
          configFile = path.join(project_folder, "../config/radarr.json");
        }
        configData = fs.readFileSync(configFile);
        configParse = JSON.parse(configData);

        for (let s in configParse) {
          let server = configParse[s];
          if (profile.radarr && profile.radarr[server.uuid]) {
            pending[server.uuid] = {
              path: server.path_title,
              profile: server.profile,
              tag: false,
            };
          }
        }
      } else {
        if (process.pkg) {
          project_folder = path.dirname(process.execPath);
          configFile = path.join(project_folder, "./config/sonarr.json");
        } else {
          project_folder = __dirname;
          configFile = path.join(project_folder, "../config/sonarr.json");
        }
        configData = fs.readFileSync(configFile);
        configParse = JSON.parse(configData);

        for (let s in configParse) {
          let server = configParse[s];
          if (profile.sonarr && profile.sonarr[server.uuid]) {
            pending[server.uuid] = {
              path: server.path_title,
              profile: server.profile,
              tag: false,
            };
          }
        }
      }
    }
    if (Object.keys(pending).length > 0) {
      await Request.updateOne(
        { requestId: this.request.id },
        { $set: { pendingDefault: pending } }
      );

      logger.log("info", "REQ: Pending Defaults set for later");
    } else {
      logger.log("info", "REQ: No Pending Defaults to Set");
    }
  }

  async sendToDvr(profile) {
    let filterMatch = await filter(this.request);
    if (filterMatch) {
      if (!Array.isArray(filterMatch)) filterMatch = [filterMatch];
      logger.log(
        "info",
        "REQ: Matched on custom filter, sending to specified server"
      );
      logger.log("info", "REQ: Sending to DVR");
      if (this.request.type === "movie") {
        for (let i = 0; i < filterMatch.length; i++) {
          new Radarr(filterMatch[i].server).manualAdd(
            this.request,
            filterMatch[i]
          );
        }
      } else {
        for (let i = 0; i < filterMatch.length; i++) {
          new Sonarr().addShow(
            filterMatch[i].server,
            this.request,
            filterMatch[i]
          );
        }
      }
      return;
    }
    logger.log("info", "REQ: Sending to DVR");
    // If profile is set use arrs from profile
    if (profile) {
      if (profile.radarr && this.request.type === "movie") {
        Object.keys(profile.radarr).map((r) => {
          console.log(r, profile.radarr[r]);
          let active = profile.radarr[r];
          if (active) {
            new Radarr(r).processRequest(this.request.id);
          }
        });
      }
      if (profile.sonarr && this.request.type === "tv") {
        Object.keys(profile.sonarr).map((s) => {
          let active = profile.sonarr[s];
          if (active) {
            new Sonarr().addShow(s, this.request);
          }
        });
      }
    } else {
      // No profile set send to all arrs
      logger.log("info", "REQ: No profile for DVR");
      if (this.request.type === "tv") new Sonarr().addShow(false, this.request);
      if (this.request.type === "movie")
        new Radarr().processRequest(this.request.id);
    }
  }

  async removeFromDVR() {
    if (this.request) {
      if (this.request.radarrId.length > 0 && this.request.type === "movie") {
        for (let i = 0; i < Object.keys(this.request.radarrId).length; i++) {
          let radarrIds = this.request.radarrId[i];
          let rId = radarrIds[Object.keys(radarrIds)[0]];
          let serverUuid = Object.keys(radarrIds)[0];
          let server = new Radarr(serverUuid);
          try {
            server.remove(rId);
            logger.log(
              "info",
              `REQ: ${this.request.title} removed from Radarr server - ${serverUuid}`
            );
          } catch (err) {
            logger.log("error", `REQ: Error unable to remove from Radarr`, err);
          }
        }
      }
      if (this.request.sonarrId.length > 0 && this.request.type === "tv") {
        for (let i = 0; i < Object.keys(this.request.sonarrId).length; i++) {
          let sonarrIds = this.request.sonarrId[i];
          let sId = sonarrIds[Object.keys(sonarrIds)[0]];
          let serverUuid = Object.keys(sonarrIds)[0];
          try {
            new Sonarr().remove(serverUuid, sId);
            logger.log(
              "info",
              `REQ: ${this.request.title} removed from Sonarr server - ${serverUuid}`
            );
          } catch (err) {
            logger.log("error", `REQ: Error unable to remove from Sonarr`, err);
          }
        }
      }
    }
  }

  discordNotify() {
    let userData = this.user;
    const requestData = this.request;
    let type = requestData.type === "tv" ? "TV Show" : "Movie";
    [new Discord(), new Telegram()].forEach((notification) =>
      notification.send(
        "New Request",
        `A new request has been added for the ${type} "${requestData.title}"`,
        userData.title,
        `https://image.tmdb.org/t/p/w500${requestData.thumb}`
      )
    );
  }

  async mailRequest() {
    let userData = this.user;
    if (!userData.email) {
      logger.log("warn", "MAILER: No user email");
      return;
    }
    const requestData = this.request;
    let type = requestData.type === "tv" ? "TV Show" : "Movie";
    new Mailer().mail(
      `You've just requested the ${type} ${requestData.title}`,
      `${type}: ${requestData.title}`,
      `Your request has been received and you'll receive an email once it has been added to Plex!`,
      `https://image.tmdb.org/t/p/w500${requestData.thumb}`,
      [userData.email],
      [userData.title]
    );
  }

  async checkQuota() {
    let userDetails = await User.findOne({ id: this.user.id });
    if (!userDetails) return false;
    if (userDetails.role === "admin") return "admin";

    let userQuota = userDetails.quotaCount ? userDetails.quotaCount : 0;
    let profile = userDetails.profile
      ? await Profile.findById(this.user.profile)
      : false;
    let quotaCap = profile ? profile.quota : 0;

    if (quotaCap > 0 && userQuota >= quotaCap) {
      return false;
    }

    return true;
  }

  async archive(complete = Boolean, removed = Boolean, reason = false) {
    let oldReq = this.request;
    let archiveRequest = new Archive({
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
      removed: removed ? true : false,
      removed_reason: reason,
      complete: complete ? true : false,
    });
    await archiveRequest.save();
    Request.findOneAndRemove(
      {
        requestId: this.request.requestId,
      },
      { useFindAndModify: false },
      function (err, data) {
        if (err) {
          logger.log("error", `REQ: Archive Error`);
          logger.log({ level: "error", message: err });
        } else {
          logger.log("info", `REQ: Request ${oldReq.title} Archived!`);
        }
      }
    );
  }
}

module.exports = processRequest;
