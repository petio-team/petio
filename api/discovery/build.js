const User = require("../models/user");
const Discovery = require("../models/discovery");
const request = require("xhr-request");
// const { movieLookup, discoverMovie } = require("../tmdb/movie");
const getConfig = require("../util/config");
const logger = require("../util/logger");
const Movie = require("../models/movie");
const Show = require("../models/show");

module.exports = async function buildDiscovery() {
  logger.info("DISC: Started building discovery profiles");
  let users = await User.find();
  let userIds = [];
  Object.keys(users).map((i) => {
    if (users[i].altId) {
      userIds.push(users[i].altId);
    } else {
      userIds.push(users[i].id);
    }
  });
  await Promise.all(
    userIds.map(async (i) => {
      await userBuild(i);
    })
  );
  logger.info("DISC: Finished building discovery profiles");
};

function userBuild(id) {
  return new Promise((resolve) => {
    create(id).then(() => resolve());
  });
}

async function create(id) {
  try {
    let data = await build(id);
    let existing = await Discovery.findOne({ id: id });
    if (existing) {
      existing.id = id;
      existing.movie = {
        genres: data.movie.genres,
        history: data.movie.history,
      };
      existing.series = {
        genres: data.series.genres,
        history: data.series.history,
      };
      existing.save();
    } else {
      let newDiscover = new Discovery({
        id: id,
        movie: {
          genres: data.movie.genres,
          history: data.movie.history,
        },
        series: {
          genres: data.series.genres,
          history: data.series.history,
        },
      });
      newDiscover.save();
    }
  } catch (err) {
    //
    console.log(err);
  }
  return;
}

async function build(id) {
  let movie = {
    history: {},
    genres: {},
  };
  let series = {
    history: {},
    genres: {},
  };
  let data = await getHistory(id);
  if (data.MediaContainer.size === 0) {
    logger.verbose(`DISC: No history for user - ${id}`);
    return {
      movie: movie,
      series: series,
    };
  }
  let items = data.MediaContainer.Metadata;
  for (let i = 0; i < items.length; i++) {
    let listItem = items[i];
    if (listItem.type === "movie") {
      let dbItem = await Movie.findOne({ ratingKey: listItem.ratingKey });
      if (dbItem) {
        if (dbItem.tmdb_id) movie.history[dbItem.tmdb_id] = dbItem.tmdb_id;
        if (dbItem.Genre) {
          for (let g = 0; g < dbItem.Genre.length; g++) {
            let genre = dbItem.Genre[g];
            if (!movie.genres[genre.tag]) {
              movie.genres[genre.tag] = {
                count: 1,
                name: genre.tag,
              };
            } else {
              movie.genres[genre.tag].count = movie.genres[genre.tag].count + 1;
            }
          }
        }
      }
    } else if (listItem.type === "episode") {
      if (listItem.grandparentKey) {
        let key = listItem.grandparentKey.replace("/library/metadata/", "");
        let dbItem = await Show.findOne({ ratingKey: key });
        if (dbItem) {
          if (dbItem.tmdb_id) series.history[dbItem.tmdb_id] = dbItem.tmdb_id;
          if (dbItem.Genre) {
            for (let g = 0; g < dbItem.Genre.length; g++) {
              let genre = dbItem.Genre[g];
              if (!series.genres[genre.tag]) {
                series.genres[genre.tag] = {
                  count: 1,
                  name: genre.tag,
                };
              } else {
                series.genres[genre.tag].count =
                  series.genres[genre.tag].count + 1;
              }
            }
          }
        }
      }
    }
  }
  return {
    movie: movie,
    series: series,
  };
}

function getHistory(id, library = false) {
  const prefs = getConfig();
  return new Promise((resolve, reject) => {
    let url = `${prefs.plexProtocol}://${prefs.plexIp}:${
      prefs.plexPort
    }/status/sessions/history/all?sort=viewedAt%3Adesc&accountID=${id}&viewedAt>=0${
      library ? "&librarySectionID=" + library : ""
    }&X-Plex-Container-Start=0&X-Plex-Container-Size=300&X-Plex-Token=${
      prefs.plexToken
    }`;
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
