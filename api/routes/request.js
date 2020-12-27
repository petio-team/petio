// Config
const getConfig = require("../util/config");

const express = require("express");
const router = express.Router();
const Request = require("../models/request");
const User = require("../models/user");
const Mailer = require("../mail/mailer");
const Sonarr = require("../services/sonarr");
const Radarr = require("../services/radarr");

router.post("/add", async (req, res) => {
  let user = req.body.user;
  let request = req.body.request;
  let existing = await Request.findOne({ requestId: request.id });
  if (existing) {
    let updatedRequest = await Request.updateOne({ requestId: request.id }, { $push: { users: user.id } });
    res.json(updatedRequest);
    mailRequest(user.id, request.id);
  } else {
    const newRequest = new Request({
      requestId: request.id,
      type: request.type,
      title: request.title,
      thumb: request.thumb,
      users: [user.id],
      imdb_id: request.imdb_id,
      tmdb_id: request.tmdb_id,
      tvdb_id: request.tvdb_id,
    });

    try {
      const savedRequest = await newRequest.save();
      res.json(savedRequest);
      mailRequest(user.id, request.id);
      let sonarr = new Sonarr();
      let radarr = new Radarr();
      sonarr.getRequests();
      radarr.getRequests();
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "error adding request" });
    }
  }
});

async function mailRequest(user, request) {
  const prefs = getConfig();
  let userData = await User.findOne({ id: user });
  if (!userData) {
    userData = {
      email: prefs.adminEmail,
    };
  }
  const requestData = await Request.findOne({ requestId: request });
  console.log(requestData);
  let type = requestData.type === "tv" ? "TV Show" : "Movie";
  new Mailer().mail(
    `You've just requested the ${type} ${requestData.title}`,
    `${type}: ${requestData.title}`,
    `Your request has been received and you'll receive an email once it has been added to Plex!`,
    `https://image.tmdb.org/t/p/w500${requestData.thumb}`,
    [userData.email]
  );
}

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

        if (request.type === "movie" && request.radarrId.length > 0) {
          for (let i = 0; i < request.radarrId.length; i++) {
            let server = new Radarr(i);
            let radarrIds = request.radarrId[i];
            let rId = radarrIds[Object.keys(radarrIds)[0]];
            children[i] = {};
            children[i].id = rId;
            children[i].info = await server.movie(rId);
            children[i].info.serverName = server.config.title;
            children[i].status = [];
            for (let o = 0; o < radarrQ[i].records.length; o++) {
              if (radarrQ[i].records[o].movieId === rId) {
                children[i].status[o] = radarrQ[i].records[o];
              }
            }
          }
        }

        if (request.type === "tv" && request.sonarrId.length > 0) {
          for (let i = 0; i < request.sonarrId.length; i++) {
            let server = new Sonarr(i);
            let sonarrIds = request.sonarrId[i];
            let sId = sonarrIds[Object.keys(sonarrIds)[0]];
            children[i] = {};
            children[i].id = sId;
            children[i].info = await server.series(sId);
            children[i].info.serverName = server.config.title;
            children[i].status = [];
            // children[i] = sonarrQ;
            for (let o = 0; o < sonarrQ[i].length; o++) {
              if (sonarrQ[i][o].series.id === sId) {
                children[i].status.push(sonarrQ[i][o]);
              }
            }
          }
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
        };
      })
    );
  } catch (err) {
    console.log(err);
    console.log(`ERR: Error getting requests`);
  }
  res.json(data);
});

module.exports = router;
