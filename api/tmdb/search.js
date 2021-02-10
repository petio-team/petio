// Config
const getConfig = require("../util/config");
const request = require("xhr-request");
const onServer = require("../plex/onServer");
var sanitize = require("sanitize-filename");
const logger = require("../util/logger");

async function search(term) {
  logger.log("verbose", `TMDB Search ${term}`);
  let movies = await searchMovies(sanitize(term));
  let shows = await searchShows(sanitize(term));
  let people = await searchPeople(sanitize(term));

  for (let i = 0; i < movies.results.length; i++) {
    let res = await onServer("movie", false, false, movies.results[i].id);
    movies.results[i].on_server = res.exists;
  }

  for (let i = 0; i < shows.results.length; i++) {
    let res = await onServer("show", false, false, shows.results[i].id);
    shows.results[i].on_server = res.exists;
  }

  return {
    movies: movies.results,
    shows: shows.results,
    people: people.results,
  };
}

async function searchMovies(term) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}search/movie?query=${term}&include_adult=false&api_key=${tmdbApikey}&append_to_response=credits,videos`;
  let data = await exec(url);
  return data;
}

async function searchShows(term) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}search/tv?query=${term}&include_adult=false&api_key=${tmdbApikey}&append_to_response=credits,videos`;
  let data = await exec(url);
  return data;
}

async function searchPeople(term) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}search/person?query=${term}&include_adult=false&api_key=${tmdbApikey}&append_to_response=credits,videos`;
  let data = await exec(url);
  return data;
}

function exec(url) {
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

module.exports = search;
