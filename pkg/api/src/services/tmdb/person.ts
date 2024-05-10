import axios from 'axios';
import http from 'http';

import { TMDB_API_KEY } from '@/infrastructure/config/env';
import logger from '@/infrastructure/logger/logger';

const agent = new http.Agent({ family: 4 });

async function personLookup(id) {
  logger.debug(`TMDB Person Lookup ${id}`, {
    module: 'tmdb.person',
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
  const url = `${tmdb}person/${id}?api_key=${TMDB_API_KEY}&append_to_response=images`;
  const res = await axios.get(url, { httpAgent: agent });
  return res.data;
}

async function getPersonMovies(id) {
  const tmdb = 'https://api.themoviedb.org/3/';
  const url = `${tmdb}person/${id}/movie_credits?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`;
  const res = await axios.get(url, { httpAgent: agent });
  return res.data;
}

async function getPersonShows(id) {
  const tmdb = 'https://api.themoviedb.org/3/';
  const url = `${tmdb}person/${id}/tv_credits?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`;
  const res = await axios.get(url, { httpAgent: agent });
  return res.data;
}
