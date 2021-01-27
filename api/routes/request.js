const express = require("express");
const router = express.Router();
const Request = require("../models/request");
const User = require("../models/user");
const Admin = require("../models/admin");
const Mailer = require("../mail/mailer");
const Sonarr = require("../services/sonarr");
const Radarr = require("../services/radarr");
const movieLookup = require("../tmdb/movie");
const showLookup = require("../tmdb/show");
const processRequest = require("../requests/process");

router.post("/add", async (req, res) => {
  let user = req.body.user;
  let request = req.body.request;
  let process = await new processRequest(request, user).new();
  if (process.error) {
    res.status(500).json(process);
  } else {
    res.json(process);
  }
});

router.get("/min", async (req, res) => {
  const requests = await Request.find();
  let data = {};
  try {
    data = {};

    await Promise.all(
      requests.map(async (request, i) => {
        data[request.requestId] = {
          title: request.title,
          requestId: request.requestId,
          type: request.type,
          thumb: request.thumb,
          imdb_id: request.imdb_id,
          tmdb_id: request.tmdb_id,
          tvdb_id: request.tvdb_id,
          users: request.users,
          sonarrId: request.sonarrId,
          radarrId: request.radarrId,
          approved: request.approved,
        };
      })
    );
  } catch (err) {
    console.log(err);
    console.log(`ERR: Error getting requests`);
  }
  res.json(data);
});

router.get("/all", async (req, res) => {
  const requests = await Request.find();
  let data = {};
  let sonarr = new Sonarr();
  let radarr = new Radarr();
  try {
    let sonarrQ = await sonarr.queue();
    let radarrQ = await radarr.queue();

    data = {};

    await Promise.all(
      requests.map(async (request, i) => {
        let children = [];
        let media = [];
        if (request.type === "movie" && request.radarrId.length > 0) {
          for (let i = 0; i < Object.keys(request.radarrId).length; i++) {
            let radarrIds = request.radarrId[i];
            let rId = radarrIds[Object.keys(radarrIds)[0]];
            let serverUuid = Object.keys(radarrIds)[0];
            let server = new Radarr(serverUuid);
            children[i] = {};
            children[i].id = rId;
            children[i].info = await server.movie(rId);
            children[i].info.serverName = server.config.title;
            children[i].status = [];
            if (radarrQ[i]) {
              for (let o = 0; o < radarrQ[i].records.length; o++) {
                if (radarrQ[i].records[o].movieId === rId) {
                  children[i].status[o] = radarrQ[i].records[o];
                }
              }
            }
          }
          media = await movieLookup(request.requestId, true);
        }

        if (request.type === "tv" && request.sonarrId.length > 0) {
          for (let i = 0; i < Object.keys(request.sonarrId).length; i++) {
            let sonarrIds = request.sonarrId[i];
            let sId = sonarrIds[Object.keys(sonarrIds)[0]];
            let serverUuid = Object.keys(sonarrIds)[0];
            let server = new Sonarr(serverUuid);
            children[i] = {};
            children[i].id = sId;
            children[i].info = await server.series(sId);
            children[i].info.serverName = server.config.title;
            children[i].status = [];
            if (sonarrQ[i]) {
              for (let o = 0; o < sonarrQ[i].length; o++) {
                if (sonarrQ[i][o].series.id === sId) {
                  children[i].status.push(sonarrQ[i][o]);
                }
              }
            }
          }
          media = await showLookup(request.requestId, true);
        }

        data[request.requestId] = {
          title: request.title,
          children: children,
          requestId: request.requestId,
          type: request.type,
          thumb: request.thumb,
          imdb_id: request.imdb_id,
          tmdb_id: request.tmdb_id,
          tvdb_id: request.tvdb_id,
          users: request.users,
          sonarrId: request.sonarrId,
          radarrId: request.radarrId,
          media: media,
          approved: request.approved,
        };
      })
    );
  } catch (err) {
    console.log(err);
    console.log(`ERR: Error getting requests`);
  }
  res.json(data);
});

router.post("/remove", async (req, res) => {
  let request = req.body.request;
  let reason = req.body.reason;
  await new processRequest(request).archive(false, true, reason);
  res.status(200).send();
  let emails = [];
  let titles = [];
  await Promise.all(
    request.users.map(async (user) => {
      let userData = await User.findOne({ id: user });
      if (!userData) {
        userData = await Admin.findOne({ id: user });
      }
      if (!userData) return;
      emails.push(userData.email);
      titles.push(userData.title);
    })
  );
  console.log(
    `Your request was ${request.approved ? "removed" : "denied"} for ${request.title}`,
    `Your request was ${request.approved ? "removed" : "denied"} for ${request.title}`,
    `Unfortunately your request could not be processed.${reason ? ` This is because - ${reason}.` : ""} Thanks for your request anyway!`,
    `https://image.tmdb.org/t/p/w500${request.thumb}`,
    emails,
    titles
  );
  new Mailer().mail(
    `Your request was ${request.approved ? "removed" : "denied"} for ${request.title}`,
    `Your request was ${request.approved ? "removed" : "denied"} for ${request.title}`,
    `Unfortunately your request could not be processed.${reason ? ` This is because - ${reason}.` : ""} Thanks for your request anyway!`,
    `https://image.tmdb.org/t/p/w500${request.thumb}`,
    emails,
    titles
  );
});

module.exports = router;
