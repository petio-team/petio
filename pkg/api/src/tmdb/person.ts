import http from "http";
import axios from "axios";

import logger from "@/loaders/logger";
import { tmdbApiKey } from "@/app/env";

const agent = new http.Agent({ family: 4 });

async function personLookup(id) {
  logger.verbose(`TMDB Person Lookup ${id}`, {
    label: "tmdb.person",
  });
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
export default personLookup;

async function getPersonInfo(id) {
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}person/${id}?api_key=${tmdbApiKey}&append_to_response=images`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

async function getPersonMovies(id) {
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}person/${id}/movie_credits?api_key=${tmdbApiKey}&append_to_response=credits,videos`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

async function getPersonShows(id) {
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}person/${id}/tv_credits?api_key=${tmdbApiKey}&append_to_response=credits,videos`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}
