// Config
const getConfig = require("../util/config");
const request = require("xhr-request");
const onServer = require("../plex/onServer");
const { movieLookup } = require("../tmdb/movie");
const { showLookup } = require("../tmdb/show");

const cacheManager = require("cache-manager");
const memoryCache = cacheManager.caching({
  store: "memory",
  max: 3,
  ttl: 86400 /*seconds*/,
});

const logger = require("../util/logger");

async function trending() {
  logger.log("verbose", `TMDB Trending lookup`);
  let person = await getPerson();
  let movies = await getMovies();
  let tv = await getShows();

  for (let i = 0; i < movies.results.length; i++) {
    movies.results[i] = await movieLookup(movies.results[i].id, true);
  }

  for (let i = 0; i < tv.results.length; i++) {
    tv.results[i] = await showLookup(tv.results[i].id, true);
  }

  let data = {
    people: person.results,
    movies: movies.results,
    tv: tv.results,
  };

  return data;
}

// Caching Layer

async function getPerson() {
  let data = false;
  try {
    data = await memoryCache.wrap("person", function () {
      return personData();
    });
  } catch (err) {
    logger.log("warn", `Error getting trending people`);
    logger.log({ level: "error", message: err });
  }
  return data;
}

async function getMovies() {
  let data = false;
  try {
    data = await memoryCache.wrap("movies", function () {
      return moviesData();
    });
  } catch (err) {
    logger.log("warn", `Error getting trending movies`);
    logger.log({ level: "error", message: err });
  }
  return data;
}

async function getShows() {
  let data = false;
  try {
    data = await memoryCache.wrap("shows", function () {
      return showsData();
    });
  } catch (err) {
    logger.log("warn", `Error getting trending shows`);
    logger.log({ level: "error", message: err });
  }
  return data;
}

// Lookup layer

function personData() {
  logger.log("verbose", "Person from source not cache");
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}trending/person/day?api_key=${tmdbApikey}&append_to_response=images`;
  return new Promise((resolve, reject) => {
    request(
      url,
      {
        method: "GET",
        json: true,
      },
      function (err, data) {
        if (err) {
          reject();
        }

        resolve(data);
      }
    );
  });
}

function moviesData() {
  logger.log("verbose", "Movies from source not cache");
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}trending/movie/day?api_key=${tmdbApikey}&append_to_response=images`;
  return new Promise((resolve, reject) => {
    request(
      url,
      {
        method: "GET",
        json: true,
      },
      function (err, data) {
        if (err) {
          reject();
        }

        resolve(data);
      }
    );
  });
}

function showsData() {
  logger.log("verbose", "Shows from source not cache");
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}trending/tv/day?api_key=${tmdbApikey}&append_to_response=images`;
  return new Promise((resolve, reject) => {
    request(
      url,
      {
        method: "GET",
        json: true,
      },
      function (err, data) {
        if (err) {
          reject();
        }

        resolve(data);
      }
    );
  });
}

module.exports = trending;
