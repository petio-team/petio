import cacheManager from "cache-manager";
import http from "http";
import axios from "axios";
import Promise from "bluebird";

import { movieLookup } from "../tmdb/movie";
import { showLookup } from "../tmdb/show";
import logger from "../app/logger";
import { tmdbApiKey } from "../app/env";

const agent = new http.Agent({ family: 4 });
const memoryCache = cacheManager.caching({
  store: "memory",
  max: 3,
  ttl: 86400 /*seconds*/,
});

async function trending() {
  logger.verbose(`TMDB Trending lookup`, { label: "tmdb.trending" });

  let [person, movies, tv]: any = await Promise.all([
    getPerson(),
    getMovies(),
    getShows(),
  ]);

  await Promise.map(
    movies.results,
    async (result: any, i) => {
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
    async (result: any, i) => {
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
  await Promise.map(person.results, async (result: any, i) => {
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
    networks: [
      {
        id: 213,
        logo_path: "/wwemzKWzjKYJFfCeiB57q3r4Bcm.png",
        name: "Netflix",
      },
      {
        id: 2,
        logo_path: "/2uy2ZWcplrSObIyt4x0Y9rkG6qO.png",
        name: "ABC (US)",
      },
      {
        id: 19,
        logo_path: "/1DSpHrWyOORkL9N2QHX7Adt31mQ.png",
        name: "FOX (US)",
      },
      {
        id: 453,
        logo_path: "/pqUTCleNUiTLAVlelGxUgWn1ELh.png",
        name: "Hulu",
      },
      {
        id: 67,
        logo_path: "/Allse9kbjiP6ExaQrnSpIhkurEi.png",
        name: "Showtime",
      },
      {
        id: 2739,
        logo_path: "/gJ8VX6JSu3ciXHuC2dDGAo2lvwM.png",
        name: "Disney+",
      },
      {
        id: 64,
        logo_path: "/tmttRFo2OiXQD0EHMxxlw8EzUuZ.png",
        name: "Discovery",
      },
      {
        id: 49,
        logo_path: "/tuomPhY2UtuPTqqFnKMVHvSb724.png",
        name: "HBO",
      },
      {
        id: 65,
        logo_path: "/m7iLIC5UfC2Pp60bkjXMWLFrmp6.png",
        name: "History",
      },
      {
        id: 6,
        logo_path: "/nGRVQlfmPBmfkNgCFpx5m7luTxG.png",
        name: "NBC",
      },
    ],
  };

  return data;
}
export default trending;

// Caching Layer

async function getPerson() {
  let data = false;
  try {
    data = await memoryCache.wrap("trending_person", function () {
      return personData();
    });
  } catch (err) {
    logger.warn(`Error getting trending people`, {
      label: "tmdb.trending",
    });
    logger.error(err, { label: "tmdb.trending" });
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
    logger.warn(`Error getting trending movies`, {
      label: "tmdb.trending",
    });
    logger.error(err, { label: "tmdb.trending" });
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
    logger.warn(`Error getting trending shows`, {
      label: "tmdb.trending",
    });
    logger.error(err, { label: "tmdb.trending" });
  }
  return data;
}

// Lookup layer

async function personData() {
  logger.verbose("Person from source not cache", {
    label: "tmdb.trending",
  });
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}trending/person/week?api_key=${tmdbApiKey}&append_to_response=images`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

async function moviesData() {
  logger.verbose("Movies from source not cache", {
    label: "tmdb.trending",
  });
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}trending/movie/week?api_key=${tmdbApiKey}&append_to_response=images,videos`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

async function showsData() {
  logger.verbose("Shows from source not cache", {
    label: "tmdb.trending",
  });
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}trending/tv/week?api_key=${tmdbApiKey}&append_to_response=images,videos`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}
