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

    data.sonarrQueue = sonarrQ;
    data.radarrQueue = radarrQ;

    await Promise.all(
      requests.map(async (request, i) => {
        let status = false;
        let info = false;

        // if (request.type === "tv" && request.sonarrId) {
        //   status = sonarrQ.filter((obj) => {
        //     return obj.series.id === request.sonarrId;
        //   });
        //   info = await sonarr.series(request.sonarrId);
        // }
        // if (request.type === "movie" && request.radarrId) {
        //   if (radarrQ.records.length > 0)
        //     status = radarrQ.records.filter((obj) => {
        //       return obj.movieId === request.radarrId;
        //     });
        //   info = await radarr.movie(request.radarrId);
        // }

        data[request.requestId] = {
          title: request.title,
          status: status,
          info: info,
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
