import http from "http";
import axios from "axios";
import Promise from "bluebird";
import sanitize from "sanitize-filename";

import logger from "@/loaders/logger";
import onServer from "@/plex/server";
import { movieLookup } from "@/tmdb/movie";
import { showLookup } from "@/tmdb/show";
import { tmdbApiKey } from "@/app/env";

const agent = new http.Agent({ family: 4 });

async function search(term) {
  logger.verbose(`TMDB Search ${term}`, { label: "tmdb.search" });

  let [movies, shows, people, companies] = await Promise.all([
    searchMovies(sanitize(term)),
    searchShows(sanitize(term)),
    searchPeople(sanitize(term)),
    searchCompanies(sanitize(term)),
  ]);

  await Promise.map(
    movies.results,
    async (result: any, i) => {
      movieLookup(result.id, true);
      let res: any = await onServer("movie", false, false, result.id);
      movies.results[i].on_server = res.exists;
    },
    { concurrency: 10 }
  );

  await Promise.map(
    shows.results,
    async (result: any, i) => {
      showLookup(result.id, true);
      let res: any = await onServer("show", false, false, result.id);
      shows.results[i].on_server = res.exists;
    },
    { concurrency: 10 }
  );

  return {
    movies: movies.results,
    shows: shows.results,
    people: people.results,
    companies: companies.results,
  };
}
export default search;

async function searchMovies(term) {
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}search/movie?query=${term}&include_adult=false&api_key=${tmdbApiKey}&append_to_response=credits,videos`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    logger.error("Error searching for movies", {
      label: "tmdb.search",
    });
    return {
      results: [],
    };
  }
}

async function searchShows(term) {
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}search/tv?query=${term}&include_adult=false&api_key=${tmdbApiKey}&append_to_response=credits,videos`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    logger.error("Error searching for shows", {
      label: "tmdb.search",
    });
    return {
      results: [],
    };
  }
}

async function searchPeople(term) {
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}search/person?query=${term}&include_adult=false&api_key=${tmdbApiKey}&append_to_response=credits,videos`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    logger.error("Error searching for people", {
      label: "tmdb.search",
    });
    return {
      results: [],
    };
  }
}

async function searchCompanies(term) {
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}search/company?query=${term}&api_key=${tmdbApiKey}`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    logger.error("Error searching for companies", {
      label: "tmdb.search",
    });
    return {
      results: [],
    };
  }
}
