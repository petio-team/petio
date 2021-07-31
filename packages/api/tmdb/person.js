import http from "http";
const agent = new http.Agent({ family: 4 });
import axios from "axios";

// Config
import getConfig from "../util/config";

import logger from "../util/logger";

async function personLookup(id) {
  logger.log("verbose", `TMDB Person Lookup ${id}`);
  let info = await getPersonInfo(id);
  let movies = await getPersonMovies(id);
  let tv = await getPersonShows(id);

  let person = {
    info: info,
    movies: movies,
    tv: tv,
  };

  return person;
}

async function getPersonInfo(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}person/${id}?api_key=${tmdbApikey}&append_to_response=images`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

async function getPersonMovies(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}person/${id}/movie_credits?api_key=${tmdbApikey}&append_to_response=credits,videos`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

async function getPersonShows(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}person/${id}/tv_credits?api_key=${tmdbApikey}&append_to_response=credits,videos`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

export default personLookup;
