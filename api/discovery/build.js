const User = require("../models/user");
const Discovery = require("../models/discovery");
const request = require("xhr-request");
// const { movieLookup, discoverMovie } = require("../tmdb/movie");
const getConfig = require("../util/config");
const logger = require("../util/logger");
const Movie = require("../models/movie");
const Show = require("../models/show");

module.exports = async function buildDiscovery() {
  let users = await User.find({ id: "13699112" });
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
};

function userBuild(id) {
  return new Promise((resolve) => {
    create(id).then(() => resolve());
  });
}

async function create(id) {
  console.log(id);
  try {
    let data = await buildGenres(id);
    console.log(data);
    let existing = await Discovery.findOne({ id: id });
    if (existing) {
      existing.id = id;
      existing.movie = {
        genres: data.movie.genres,
      };
      existing.series = {
        genres: data.series.genres,
      };
      existing.save();
    } else {
      let newDiscover = new Discovery({
        id: id,
        movie: {
          genres: data.movie.genres,
        },
        series: {
          genres: data.series.genres,
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

async function buildGenres(id) {
  let movie = {
    genres: {},
  };
  let series = {
    genres: {},
  };
  let data = await getHistory(id);
  if (data.MediaContainer.size === 0) {
    logger.warn(`DISC: No hist ${id}`);
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
    console.log(url);
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
