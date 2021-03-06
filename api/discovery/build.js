const User = require("../models/user");
const Discovery = require("../models/discovery");
const Movie = require("../models/movie");
const request = require("xhr-request");
const { movieLookup, discoverMovie } = require("../tmdb/movie");
const getConfig = require("../util/config");
const logger = require("../util/logger");
const movie = require("../models/movie");

module.exports = async function buildDiscovery() {
  let users = await User.find({ id: "11397307" });
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
  // for (let i of userIds) {
  //   await userBuild(i);
  // }
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
      existing.save();
    } else {
      let newDiscover = new Discovery({
        id: id,
        movie: {
          genres: data.movie.genres,
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
  let data = await getHistory(id, 1);
  if (data.MediaContainer.size === 0) {
    logger.warn(`DISC: No hist ${id}`);
    return;
  }
  let items = data.MediaContainer.Metadata;
  for (let i = 0; i < items.length; i++) {
    let listItem = items[i];
    let dbItem = await Movie.findOne({ ratingKey: listItem.ratingKey });
    if (dbItem && dbItem.tmdb_id) {
      let movieData = await movieLookup(dbItem.tmdb_id);
      if (movieData) {
        if (movieData.genres)
          for (let g = 0; g < movieData.genres.length; g++) {
            let genre = movieData.genres[g];
            if (!movie.genres[genre.id]) {
              movie.genres[genre.id] = {
                count: 1,
                name: genre.name,
              };
            } else {
              movie.genres[genre.id].count = movie.genres[genre.id].count + 1;
            }
          }
      }
    }
  }
  return {
    movie: movie,
  };
}

async function buildData(id) {
  let data = await getHistory(id, 1);
  console.log(data);
  if (data.MediaContainer.size === 0) {
    return { error: "No History" };
  }
  let items = data.MediaContainer.Metadata;
  let output = {
    raw: {},
    movie: {
      count: 0,
      genre: {},
      actor: {},
      director: {},
      history: [],
    },
  };

  if (items.length > 100) items.length = 100;

  for (let i = 0; i < items.length; i++) {
    let listItem = items[i];
    try {
      if (listItem.type === "movie") {
        let dbItem = await Movie.findOne({ ratingKey: listItem.ratingKey });
        if (dbItem && dbItem.tmdb_id) {
          let movieData = await movieLookup(dbItem.tmdb_id);
          if (movieData) {
            if (movieData.id) output.movie.history.push(movieData.id);
            output.movie.count += 1;
            if (movieData.credits && movieData.credits.cast) {
              if (movieData.credits.cast.length > 10)
                movieData.credits.cast.length = 10;
              for (let p = 0; p < movieData.credits.cast.length; p++) {
                let actor = movieData.credits.cast[p];
                if (!output.movie.actor[actor.id]) {
                  output.movie.actor[actor.id] = {
                    name: actor.name,
                    count: 0,
                  };
                }
                output.movie.actor[actor.id].count += 1;
              }
            }
            if (movieData.genres)
              for (let g = 0; g < movieData.genres.length; g++) {
                let genre = movieData.genres[g];
                if (!output.movie.genre[genre.name]) {
                  output.movie.genre[genre.name] = {
                    name: genre.name,
                    totalRating: 0,
                    count: 0,
                    id: genre.id,
                  };
                }

                if (movieData.imdb_data.rating) {
                  output.movie.genre[genre.name].totalRating += parseInt(
                    movieData.imdb_data.rating.ratingValue
                  );
                  output.movie.genre[genre.name].count += 1;
                }
              }
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
  Object.keys(output.movie.genre).map((i) => {
    let genre = output.movie.genre[i];
    if (genre.count === 1) delete output.movie.genre[i];
    genre.avgRating = genre.totalRating / genre.count;
  });
  Object.keys(output.movie.actor).map((i) => {
    let actor = output.movie.actor[i];
    if (actor.count === 1) delete output.movie.actor[i];
  });
  return output;
}

function getHistory(id, library = false) {
  const prefs = getConfig();
  return new Promise((resolve, reject) => {
    let url = `${prefs.plexProtocol}://${prefs.plexIp}:${
      prefs.plexPort
    }/status/sessions/history/all?sort=viewedAt%3Adesc&accountID=${id}&viewedAt>=0${
      library ? "&librarySectionID=" + library : ""
    }&X-Plex-Container-Start=0&X-Plex-Container-Size=50&X-Plex-Token=${
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
