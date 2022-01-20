const http = require("http");
const agent = new http.Agent({ family: 4 });
const axios = require("axios");
const Promise = require("bluebird");

// Config
const { conf } = require("../app/config");
const { movieLookup } = require("../tmdb/movie");
const { showLookup } = require("../tmdb/show");

const cacheManager = require("cache-manager");
const memoryCache = cacheManager.caching({
  store: "memory",
  max: 3,
  ttl: 86400 /*seconds*/,
});

const logger = require("../app/logger");

async function trending() {
  logger.log("verbose", `TMDB Trending lookup`);

  let [person, movies, tv] = await Promise.all([
    getPerson(),
    getMovies(),
    getShows(),
  ]);

  await Promise.map(
    movies.results,
    async (result, i) => {
      let movieData = await movieLookup(result.id, true);
      let videoResults = movieData.videos.results;
      movies.results[i] = {
        on_server: movieData.on_server,
        title: movieData.title,
        poster_path: movieData.poster_path,
        release_date: movieData.release_date,
        id: movieData.id,
        backdrop_path: movieData.backdrop_path,
        videos: {
          results: [
            ...videoResults.filter(
              (obj) => obj.type == "Teaser" && obj.site == "YouTube"
            ),
            ...videoResults.filter(
              (obj) => obj.type == "Trailer" && obj.site == "YouTube"
            ),
          ],
        },
      };
    },
    { concurrency: 10 }
  );

  await Promise.map(
    tv.results,
    async (result, i) => {
      let showData = await showLookup(result.id, true);
      let videoResults = showData.videos.results;
      tv.results[i] = {
        on_server: showData.on_server,
        name: showData.name,
        poster_path: showData.poster_path,
        first_air_date: showData.first_air_date,
        id: showData.id,
        backdrop_path: showData.backdrop_path,
        videos: {
          results: [
            ...videoResults.filter(
              (obj) => obj.type == "Teaser" && obj.site == "YouTube"
            ),
            ...videoResults.filter(
              (obj) => obj.type == "Trailer" && obj.site == "YouTube"
            ),
          ],
        },
      };
    },
    { concurrency: 10 }
  );

  // for (let i = 0; i < tv.results.length; i++) {
  //   let showData = await showLookup(tv.results[i].id, true);
  //   tv.results[i] = {
  //     on_server: showData.on_server,
  //     name: showData.name,
  //     poster_path: showData.poster_path,
  //     first_air_date: showData.first_air_date,
  //     id: showData.id,
  //     backdrop_path: showData.backdrop_path,
  //   };
  // }

  await Promise.map(person.results, async (result, i) => {
    person.results[i] = {
      id: result.id,
      name: result.name,
      profile_path: result.profile_path,
    };
  });

  let data = {
    people: person.results,
    movies: movies.results,
    tv: tv.results,
    companies: [
      {
        id: 2,
        logo_path: "/wdrCwmRnLFJhEoH8GSfymY85KHT.png",
        name: "Walt Disney Pictures",
      },
      {
        id: 33,
        logo_path: "/8lvHyhjr8oUKOOy2dKXoALWKdp0.png",
        name: "Universal Pictures",
      },
      {
        id: 7,
        logo_path: "/vru2SssLX3FPhnKZGtYw00pVIS9.png",
        name: "DreamWorks Pictures",
      },
      {
        id: 9993,
        logo_path: "/2Tc1P3Ac8M479naPp1kYT3izLS5.png",
        name: "DC Entertainment",
      },
      {
        id: 420,
        logo_path: "/hUzeosd33nzE5MCNsZxCGEKTXaQ.png",
        name: "Marvel Studios",
      },
      {
        id: 174,
        logo_path: "/ky0xOc5OrhzkZ1N6KyUxacfQsCk.png",
        name: "Warner Bros. Pictures",
      },
      {
        id: 4,
        logo_path: "/fycMZt242LVjagMByZOLUGbCvv3.png",
        name: "Paramount",
      },
      {
        id: 34,
        logo_path: "/GagSvqWlyPdkFHMfQ3pNq6ix9P.png",
        name: "Sony Pictures",
      },
      {
        id: 25,
        logo_path: "/qZCc1lty5FzX30aOCVRBLzaVmcp.png",
        name: "20th Century Fox",
      },
      {
        id: 1632,
        logo_path: "/cisLn1YAUuptXVBa0xjq7ST9cH0.png",
        name: "Lionsgate",
      },
      {
        id: 21,
        logo_path: "/aOWKh4gkNrfFZ3Ep7n0ckPhoGb5.png",
        name: "Metro-Goldwyn-Mayer",
      },
    ],
  };

  return data;
}

// Caching Layer

async function getPerson() {
  let data = false;
  try {
    data = await memoryCache.wrap("trending_person", function () {
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
    data = await memoryCache.wrap("trending_movies", async function () {
      return await moviesData();
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
    data = await memoryCache.wrap("trending_shows", async function () {
      return await showsData();
    });
  } catch (err) {
    logger.log("warn", `Error getting trending shows`);
    logger.log({ level: "error", message: err });
  }
  return data;
}

// Lookup layer

async function personData() {
  logger.log("verbose", "Person from source not cache");
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}trending/person/week?api_key=${conf.get('general.tmdb')}&append_to_response=images`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

async function moviesData() {
  logger.log("verbose", "Movies from source not cache");
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}trending/movie/week?api_key=${conf.get('general.tmdb')}&append_to_response=images,videos`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

async function showsData() {
  logger.log("verbose", "Shows from source not cache");
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}trending/tv/week?api_key=${conf.get('general.tmdb')}&append_to_response=images,videos`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

module.exports = trending;
