// Config
const getConfig = require("../util/config");
const request = require("xhr-request");
const onServer = require("../plex/onServer");

const cacheManager = require("cache-manager");
const memoryCache = cacheManager.caching({ store: "memory", max: 3, ttl: 86400 /*seconds*/ });

async function trending() {
  let person = await getPerson();
  let movies = await getMovies();
  let tv = await getShows();

  for (let i = 0; i < movies.results.length; i++) {
    let res = await onServer("movie", false, false, movies.results[i].id);
    movies.results[i].on_server = res.exists;
  }

  for (let i = 0; i < tv.results.length; i++) {
    let res = await onServer("show", false, false, tv.results[i].id);
    tv.results[i].on_server = res.exists;
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
    console.log(err);
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
    console.log(err);
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
    console.log(err);
  }
  return data;
}

// Lookup layer

function personData() {
  console.log("Person from source");
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
  console.log("Movies from source");
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
  console.log("Shows from source");
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
