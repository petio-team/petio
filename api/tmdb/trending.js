// Config
const getConfig = require("../util/config");
const request = require("xhr-request");
const onServer = require("../plex/onServer");

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

function getPerson() {
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

function getMovies() {
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

function getShows() {
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
