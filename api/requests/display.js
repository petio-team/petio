const { movieLookup } = require("../tmdb/movie");
const { showLookup } = require("../tmdb/show");
const Request = require("../models/request");
const Sonarr = require("../services/sonarr");
const Radarr = require("../services/radarr");

async function getRequests(user = false, all = false) {
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
        if (request.users.includes(user) || all) {
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
          }

          if (request.type === "movie") {
            media = await movieLookup(request.requestId, true);
          } else if (request.type === "tv") {
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
            process_stage: reqState(request),
          };
        }
      })
    );
  } catch (err) {
    logger.log("error", `ROUTE: Error getting requests`);
    logger.error(err.stack);
  }
  return data;
}

function reqState(req) {
  let diff;
  if (!req.approved) {
    return {
      status: "pending",
      message: "Pending",
    };
  }
  if (req.children) {
    if (req.children.length > 0) {
      for (let r = 0; r < req.children.length; r++) {
        if (req.children[r].status.length > 0) {
          return {
            status: "orange",
            message: "Downloading",
          };
        }

        if (req.children[r].info.downloaded || req.children[r].info.movieFile) {
          return {
            status: "good",
            message: "Downloaded",
          };
        }

        if (req.children[r].info.message === "NotFound") {
          return {
            status: "bad",
            message: "Removed",
          };
        }

        if (req.type === "tv" && req.children[r].info) {
          if (
            req.children[r].info.episodeCount ===
              req.children[r].info.episodeFileCount &&
            req.children[r].info.episodeCount > 0
          ) {
            return {
              status: "good",
              message: "Downloaded",
            };
          }

          if (req.children[r].info.seasons) {
            let missing = false;
            for (let season of req.children[r].info.seasons) {
              if (season.statistics.percentOfEpisodes !== 100) missing = true;
            }

            if (!missing) {
              return {
                status: "good",
                message: "Downloaded",
              };
            } else {
              let airDate = req.children[r].info.firstAired;
              diff = Math.ceil(new Date(airDate) - new Date());
              if (diff > 0) {
                return {
                  status: "blue",
                  message: `~${calcDate(diff)}`,
                };
              } else {
                if (req.children[r].info.episodeFileCount > 0) {
                  return {
                    status: "blue",
                    message: "Partially Downloaded",
                  };
                }
                return {
                  status: "bad",
                  message: "Unavailable",
                };
              }
            }
          }
        }

        if (req.type === "movie" && req.children[r].info) {
          if (
            req.children[r].info.inCinemas ||
            req.children[r].info.digitalRelease
          ) {
            if (req.children[r].info.inCinemas) {
              diff = Math.ceil(
                new Date(req.children[r].info.inCinemas) - new Date()
              );
              if (diff > 0) {
                return {
                  status: "blue",
                  message: `~${calcDate(diff)}`,
                };
              }
            }
            if (req.children[r].info.digitalRelease) {
              let digitalDate = new Date(req.children[r].info.digitalRelease);
              if (new Date() - digitalDate < 0) {
                return {
                  status: "cinema",
                  message: "In Cinemas",
                };
              } else {
                return {
                  status: "bad",
                  message: "Unavailable",
                };
              }
            } else {
              if (req.children[r].info.inCinemas) {
                diff = Math.ceil(
                  new Date() - new Date(req.children[r].info.inCinemas)
                );
                if (cinemaWindow(diff)) {
                  return {
                    status: "cinema",
                    message: "In Cinemas",
                  };
                }
              }
              return {
                status: "bad",
                message: "Unavailable",
              };
            }
          }
        }
      }
    }
  }

  return {
    status: "manual",
    message: "No Status",
  };
}

function calcDate(diff) {
  var day = 1000 * 60 * 60 * 24;

  var days = Math.ceil(diff / day);
  var months = Math.floor(days / 31);
  var years = Math.floor(months / 12);
  days = days - months * 31;
  months = months - years * 12;

  var message = "";
  message += years ? years + " yr " : "";
  message += months ? months + " m " : "";
  message += days ? days + " d " : "";

  return message;
}

function cinemaWindow(diff) {
  var day = 1000 * 60 * 60 * 24;
  var days = Math.ceil(diff / day);
  if (days >= 62) {
    return false;
  }
  return true;
}

module.exports = { getRequests };
