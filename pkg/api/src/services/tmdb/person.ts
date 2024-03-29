import http from 'http';
import axios from 'axios';

import externalConfig from "@/config/env/external";
import logger from '@/loaders/logger';

const agent = new http.Agent({ family: 4 });

async function personLookup(id) {
  logger.debug(`TMDB Person Lookup ${id}`, {
    label: 'tmdb.person',
  });
  const info = await getPersonInfo(id);
  const movies = await getPersonMovies(id);
  const tv = await getPersonShows(id);

  const person = {
    info,
    movies,
    tv,
  };

  return person;
}
export default personLookup;

async function getPersonInfo(id) {
  const tmdb = 'https://api.themoviedb.org/3/';
  const url = `${tmdb}person/${id}?api_key=${externalConfig.tmdbApiKey}&append_to_response=images`;
  const res = await axios.get(url, { httpAgent: agent });
  return res.data;
}

async function getPersonMovies(id) {
  const tmdb = 'https://api.themoviedb.org/3/';
  const url = `${tmdb}person/${id}/movie_credits?api_key=${externalConfig.tmdbApiKey}&append_to_response=credits,videos`;
  const res = await axios.get(url, { httpAgent: agent });
  return res.data;
}

async function getPersonShows(id) {
  const tmdb = 'https://api.themoviedb.org/3/';
  const url = `${tmdb}person/${id}/tv_credits?api_key=${externalConfig.tmdbApiKey}&append_to_response=credits,videos`;
  const res = await axios.get(url, { httpAgent: agent });
  return res.data;
}
