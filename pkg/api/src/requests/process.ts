import logger from "@/loaders/logger";
import Request from "@/models/request";
import Archive from "@/models/archive";
import { UserModel, UserRole } from "@/models/user";
import Profile from "@/models/profile";
import Mailer from "@/mail/mailer";
import Sonarr from "@/downloaders/sonarr";
import Radarr from "@/downloaders/radarr";
import Discord from "@/notifications/discord";
import Telegram from "@/notifications/telegram";
import { showLookup } from "@/tmdb/show";
import { config } from "@/config/index";
import filter from "./filter";

export default class processRequest {
  request: any;
  user: any;
  constructor(req = {}, usr = {}) {
    this.request = req;
    this.user = usr;
  }
  async new() {
    let out: any = {};
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
          let updatedUser = await UserModel.findOneAndUpdate(
            { id: this.user.id },
            { $inc: { quotaCount: 1 } },
            { new: true, useFindAndModify: false }
          );
          if (!updatedUser) {
            throw new Error("no user found");
          }
          out.quota = updatedUser.quotaCount;
        }
        this.mailRequest();
        this.discordNotify();
      } catch (err) {
        logger.error("REQ: Error", { label: "requests.process" });
        logger.error(err, { label: "requests.process" });
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
    let userDetails = await UserModel.findOne({ id: this.user.id });
    if (!userDetails) {
      return;
    }
    let profile = userDetails.profileId
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
    let userDetails = await UserModel.findOne({ id: this.user.id });
    if (!userDetails) {
      return;
    }
    let profile = userDetails.profileId
      ? await Profile.findById(this.user.profile)
      : false;
    let autoApprove = profile
      ? this.request.type === "movie"
        ? profile.autoApprove
        : profile.autoApproveTv
      : false;

    if (userDetails.role === UserRole.Admin) {
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
      timeStamp: new Date(),
    });

    if (this.request.type === "tv") {
      newRequest.seasons = this.request.seasons;
    }

    try {
      await newRequest.save();
      if (autoApprove) {
        this.sendToDvr(profile);
      } else {
        logger.info("REQ: Request requires approval, waiting", {
          label: "requests.process",
        });
        this.pendingDefaults(profile);
      }
    } catch (err) {
      logger.error(`REQ: Unable to save request`, {
        label: "requests.process",
      });
      logger.error(err, { label: "requests.process" });
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
    let pending: any = {};
    let filterMatch: any = await filter(this.request);
    if (filterMatch) {
      logger.info(
        "REQ: Pending Request Matched on custom filter, setting default",
        { label: "requests.process" }
      );
      for (let f = 0; f < filterMatch.length; f++) {
        let filter = filterMatch[f];
        pending[filter.server] = {
          path: filter.path,
          profile: filter.profile,
          tag: filter.tag,
        };
      }
    } else {
      if (this.request.type === "movie") {
        for (let s in config.get("radarr")) {
          const obj: any = s;
          if (profile.radarr && profile.radarr[obj.uuid]) {
            pending[obj.uuid] = {
              path: obj.path.location,
              profile: obj.profile.name,
              tag: false,
            };
          }
        }
      } else {
        for (let s in config.get("sonarr")) {
          const obj: any = s;
          if (profile.sonarr && profile.sonarr[obj.uuid]) {
            pending[obj.uuid] = {
              path: obj.path.location,
              profile: obj.profile.name,
              tag: false,
            };
          }
        }
      }
    }
    console.log(pending);
    if (Object.keys(pending).length > 0) {
      await Request.updateOne(
        { requestId: this.request.id },
        { $set: { pendingDefault: pending } }
      );

      logger.verbose("REQ: Pending Defaults set for later", {
        label: "requests.process",
      });
    } else {
      logger.verbose("REQ: No Pending Defaults to Set", {
        label: "requests.process",
      });
    }
  }

  async sendToDvr(profile) {
    let filterMatch: any = await filter(this.request);
    if (filterMatch) {
      if (!Array.isArray(filterMatch)) filterMatch = [filterMatch];
      logger.info(
        "REQ: Matched on custom filter, sending to specified server",
        { label: "requests.process" }
      );
      logger.verbose("REQ: Sending to DVR", { label: "requests.process" });
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
            { id: filterMatch[i].server },
            this.request,
            filterMatch[i]
          );
        }
      }
      return;
    }
    logger.verbose("REQ: Sending to DVR", { label: "requests.process" });
    // If profile is set use arrs from profile
    if (profile) {
      if (profile.radarr && this.request.type === "movie") {
        Object.keys(profile.radarr).map((r) => {
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
            new Sonarr().addShow({ id: s }, this.request);
          }
        });
      }
    } else {
      // No profile set send to all arrs
      logger.verbose("REQ: No profile for DVR", { label: "requests.process" });
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
            await server.remove(rId);
            logger.info(
              `REQ: ${this.request.title} removed from Radarr server - ${serverUuid}`,
              { label: "requests.process" }
            );
          } catch (err) {
            logger.error(`REQ: Error unable to remove from Radarr`, {
              label: "requests.process",
            });
            logger.error(err, { label: "requests.process" });
          }
        }
      }
      if (this.request.sonarrId.length > 0 && this.request.type === "tv") {
        for (let i = 0; i < Object.keys(this.request.sonarrId).length; i++) {
          let sonarrIds = this.request.sonarrId[i];
          let sId = sonarrIds[Object.keys(sonarrIds)[0]];
          let serverUuid = Object.keys(sonarrIds)[0];
          try {
            await new Sonarr().remove(serverUuid, sId);
            logger.info(
              `REQ: ${this.request.title} removed from Sonarr server - ${serverUuid}`,
              { label: "requests.process" }
            );
          } catch (err) {
            logger.error(`REQ: Error unable to remove from Sonarr`, {
              label: "requests.process",
            });
            logger.error(err, { label: "requests.process" });
          }
        }
      }
    }
  }

  discordNotify() {
    let userData = this.user;
    const requestData = this.request;
    let type = requestData.type === "tv" ? "TV Show" : "Movie";
    const title: any = "New Request";
    const subtitle: any = `A new request has been added for the ${type} "${requestData.title}"`;
    const image: any = `https://image.tmdb.org/t/p/w500${requestData.thumb}`;
    [new Discord(), new Telegram()].forEach((notification) =>
      notification.send(title, subtitle, userData.title, image)
    );
  }

  async mailRequest() {
    let userData: any = this.user;
    if (!userData.email) {
      logger.warn("MAILER: No user email", { label: "requests.process" });
      return;
    }
    const requestData: any = this.request;
    const email: never = userData.email as never;
    const title: never = userData.title as never;
    let type = requestData.type === "tv" ? "TV Show" : "Movie";
    new Mailer().mail(
      `You've just requested a ${type}: ${requestData.title}`,
      `${type}: ${requestData.title}`,
      `Your request has been received and you'll receive an email once it has been added to Plex!`,
      `https://image.tmdb.org/t/p/w500${requestData.thumb}`,
      [email],
      [title]
    );
  }

  async checkQuota() {
    let userDetails = await UserModel.findOne({ id: this.user.id });
    if (!userDetails) {
      return false;
    }
    if (userDetails.role === UserRole.Admin) return "admin";

    let userQuota = userDetails.quotaCount ? userDetails.quotaCount : 0;
    let profile = userDetails.profileId
      ? await Profile.findById(this.user.profile)
      : false;
    let quotaCap = profile ? profile.quota : 0;

    if (quotaCap > 0 && userQuota >= quotaCap) {
      return false;
    }

    return true;
  }

  async archive(complete: boolean, removed: boolean, reason = false) {
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
      timeStamp: this.request.timeStamp ? this.request.timeStamp : new Date(),
    });
    await archiveRequest.save();
    Request.findOneAndRemove(
      {
        requestId: this.request.requestId,
      },
      { useFindAndModify: false },
      function (err, data) {
        if (err) {
          logger.error(`REQ: Archive Error`, { label: "requests.process" });
          logger.error(err.message, { label: "requests.process" });
        } else {
          logger.verbose(`REQ: Request ${oldReq.title} Archived!`, {
            label: "requests.process",
          });
        }
      }
    );
  }
}
