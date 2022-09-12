import axios from 'axios';
import http from 'http';

import env from '@/config/env';
import logger from '@/loaders/logger';

const agent = new http.Agent({ family: 4 });

async function personLookup(id) {
  logger.verbose(`TMDB Person Lookup ${id}`, {
    label: 'tmdb.person',
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
  const tmdb = 'https://api.themoviedb.org/3/';
  let url = `${tmdb}person/${id}?api_key=${env.api.tmdb.key}&append_to_response=images`;
  let res = await axios.get(url, { httpAgent: agent });
  return res.data;
}

async function getPersonMovies(id) {
  const tmdb = 'https://api.themoviedb.org/3/';
  let url = `${tmdb}person/${id}/movie_credits?api_key=${env.api.tmdb.key}&append_to_response=credits,videos`;
  let res = await axios.get(url, { httpAgent: agent });
  return res.data;
}

async function getPersonShows(id) {
  const tmdb = 'https://api.themoviedb.org/3/';
  let url = `${tmdb}person/${id}/tv_credits?api_key=${env.api.tmdb.key}&append_to_response=credits,videos`;
  let res = await axios.get(url, { httpAgent: agent });
  return res.data;
}
