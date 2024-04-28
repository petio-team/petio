/* eslint-disable @typescript-eslint/no-use-before-define */
import axios, { AxiosResponse } from 'axios';
import http from 'http';

import { TMDB_API_KEY } from '@/infra/config/env';
import loggerMain from '@/infra/logger/logger';
import fanartLookup from '@/services/fanart';
import { lookup } from '@/services/meta/imdb';
import onServer from '@/services/plex/server';
import getLanguage from '@/services/tmdb/languages';

import cache from '../cache/cache';

const agent = new http.Agent({ family: 4 });

const logger = loggerMain.child({ module: 'tmdb.movie' });

export async function movieLookup(id, minified = false) {
  logger.debug(`TMDB Movie Lookup ${id}`);
  if (!id || id === 'false') {
    return 'No ID';
  }
  let fanart: any;
  try {
    fanart = minified ? false : await fanartLookup(id, 'movies');
  } catch (err) {
    logger.error(`failed getting fanart data - ${id}`, err);
  }
  let movie: any = false;
  let data: any;
  try {
    data = await getMovieData(id);
    movie = { ...data };
  } catch {
    return { error: 'unable to get movie data' };
  }
  if (movie.success === false) {
    return { error: 'movie was invalid' };
  }
  if (movie) {
    if (!movie.id) {
      return { error: 'no id returned' };
    }
    if (fanart) {
      if (fanart.hdmovielogo) {
        movie.logo = findEnLogo(fanart.hdmovielogo);
      }
      if (fanart.moviethumb) {
        movie.tile = findEnLogo(fanart.moviethumb);
      }
    }
    try {
      let collectionData: any = false;
      let [
        // eslint-disable-next-line prefer-const
        onPlex,
        recommendations,
        // eslint-disable-next-line prefer-const
        similar,
        // eslint-disable-next-line prefer-const
        imdbData,
        // eslint-disable-next-line prefer-const
        collection,
        // eslint-disable-next-line prefer-const
        reviews,
      ]: any = await Promise.all([
        onServer('movie', movie.imdb_id, false, id),
        getRecommendations(id),
        getSimilar(id),
        !minified && movie.imdb_id ? lookup(movie.imdb_id) : false,
        !minified && movie.belongs_to_collection
          ? getCollection(movie.belongs_to_collection.id)
          : false,
        !minified ? getReviews(id) : false,
      ]);

      const recommendationsData: any = [];
      movie.on_server = onPlex.exists;
      movie.available_resolutions = onPlex.resolutions;
      movie.imdb_data = imdbData;
      movie.reviews = reviews.results;
      if (!minified) {
        if (
          recommendations.results.length === 0 &&
          similar.results.length === 0
        ) {
          const params: any = {};
          if (movie.genres) {
            let genres = '';
            // eslint-disable-next-line no-restricted-syntax
            for (const element of movie.genres) {
              genres += `${element.id},`;
            }

            params.with_genres = genres;
          }
          recommendations = await discoverMovie(1, params);
        }
      }
      if (recommendations)
        Object.keys(recommendations.results).forEach((key) => {
          const recommendation = recommendations.results[key];
          if (recommendation.id !== parseInt(id, 10))
            recommendationsData.push(recommendation.id);
        });
      if (similar)
        Object.keys(similar.results).forEach((key) => {
          const recommendation = similar.results[key];
          if (
            recommendation.id !== parseInt(id, 10) &&
            !recommendationsData.includes(recommendation.id)
          )
            recommendationsData.push(recommendation.id);
        });
      if (!minified && movie.belongs_to_collection) {
        collectionData = collection.parts.map((part) => part.id);
      }

      movie.recommendations = recommendationsData;
      movie.collection = collectionData;
      movie.keywords = movie.keywords.keywords;
      movie.videos = {
        results: [
          ...(
            movie.videos.results as Array<{
              type: string;
              site: string;
            }>
          ).filter((obj) => obj.type === 'Trailer' && obj.site === 'YouTube'),
          ...(
            movie.videos.results as Array<{
              type: string;
              site: string;
            }>
          ).filter((obj) => obj.type === 'Teaser' && obj.site === 'YouTube'),
        ],
      };
      delete movie.production_countries;
      delete movie.adult;
      delete movie.original_title;
      if (minified) {
        delete movie.credits;
        delete movie.belongs_to_collection;
        delete movie.genres;
        delete movie.homepage;
        delete movie.popularity;
        delete movie.recommendations;
        delete movie.revenue;
        delete movie.runtime;
        delete movie.spoken_languages;
        delete movie.status;
        delete movie.tagline;
        delete movie.vote_average;
        delete movie.vote_count;
        delete movie.adult;
        delete movie.genre_ids;
        delete movie.original_language;
        delete movie.overview;
      } else {
        movie.original_language_format = getLanguage(movie.original_language);
      }

      return movie;
    } catch (err) {
      logger.error(`Error processing movie data - ${id}`, err);
      return { error: 'not found' };
    }
  }
  return {};
}

interface MovieData {
  id: number;
  imdb_id: string;
  belongs_to_collection: {
    id: number;
  };
  keywords: {
    keywords: string[];
  };
  videos: {
    results: {
      type: string;
      site: string;
    }[];
  };
  production_countries: any;
  adult: any;
  original_title: any;
  credits: any;
  genres: any;
  homepage: any;
  popularity: any;
  recommendations: any;
  revenue: any;
  runtime: any;
  spoken_languages: any;
  status: any;
  tagline: any;
  vote_average: any;
  vote_count: any;
  original_language: string;
  overview: string;
}

async function getMovieData(id: number): Promise<MovieData | false> {
  let data: MovieData | false = false;
  try {
    data = await cache.wrap<MovieData | false>(`movie_data_${id}`, async () =>
      tmdbData(id),
    );
  } catch (err) {
    logger.error(`failed getting movie data - ${id}`, err);
  }
  return data;
}

export async function getRecommendations(id: number, page = 1) {
  let data = false;
  try {
    data = await cache.wrap(`rec_${id}_${page}`, async () =>
      recommendationData(id, page),
    );
  } catch (err) {
    logger.error(`failed getting movie recommendations - ${id}`, err);
  }
  return data;
}

export async function getSimilar(id: number, page = 1) {
  let data = false;
  try {
    data = await cache.wrap(`similar_${id}_${page}`, async () =>
      similarData(id, page),
    );
  } catch (err) {
    logger.error(`failed getting movie similar - ${id}`, err);
  }
  return data;
}

async function getReviews(id: number): Promise<any> {
  let data: any = false;
  try {
    data = await cache.wrap(`rev_${id}`, async () => reviewsData(id));
  } catch (err) {
    logger.error(`failed getting movie reviews - ${id}`, err);
  }
  return data;
}

async function getCollection(id: number): Promise<any> {
  let data: any = false;
  try {
    data = await cache.wrap(`col_${id}`, async () => getCollectionData(id));
  } catch (err) {
    logger.error(`failed getting movie collections - ${id}`, err);
  }
  return data;
}

// Lookup Layer

async function tmdbData(id: number): Promise<MovieData> {
  const tmdb = 'https://api.themoviedb.org/3/';
  const url = `${tmdb}movie/${id}?api_key=${externalConfig.tmdbApiKey}&append_to_response=credits,videos,keywords,release_dates`;
  const res = await axios.get(url, { httpAgent: agent });
  const { data } = res;
  data.timestamp = new Date();
  if (data.release_dates) {
    data.age_rating = findEnRating(data.release_dates.results);
    delete data.release_dates;
  }
  return data;
}

async function recommendationData(id: number, page = 1): Promise<any> {
  const tmdb = 'https://api.themoviedb.org/3/';
  const url = `${tmdb}movie/${id}/recommendations?api_key=${externalConfig.tmdbApiKey}&page=${page}&append_to_response=videos`;
  const res = await axios.get(url, { httpAgent: agent });
  return res.data;
}

async function similarData(id: number, page = 1): Promise<any> {
  const tmdb: string = 'https://api.themoviedb.org/3/';
  const url: string = `${tmdb}movie/${id}/similar?api_key=${externalConfig.tmdbApiKey}&page=${page}&append_to_response=videos`;
  const res: any = await axios.get(url, { httpAgent: agent });
  return res.data;
}

async function getCollectionData(id: number): Promise<any> {
  const tmdb: string = 'https://api.themoviedb.org/3/';
  const url: string = `${tmdb}collection/${id}?api_key=${externalConfig.tmdbApiKey}&append_to_response=videos`;
  const res: any = await axios.get(url, { httpAgent: agent });
  return res.data;
}

async function reviewsData(id: number): Promise<any> {
  const tmdb: string = 'https://api.themoviedb.org/3/';
  const url: string = `${tmdb}movie/${id}/reviews?api_key=${externalConfig.tmdbApiKey}`;
  const res: any = await axios.get(url, { httpAgent: agent });
  return res.data;
}

// Lets i18n this soon
function findEnLogo(logos: { lang: string; url: string }[]): string | false {
  let logoUrl: string | false = false;
  logos.forEach((logo) => {
    // For some reason fanart defaults to this obscure logo sometimes so lets exclude it
    if (
      logo.lang === 'en' &&
      !logoUrl &&
      logo.url !==
        'https://assets.fanart.tv/fanart/tv/0/hdtvlogo/-60a02798b7eea.png' &&
      logo.url !==
        'http://assets.fanart.tv/fanart/tv/0/hdtvlogo/-60a02798b7eea.png'
    ) {
      logoUrl = logo.url;
    }
  });

  return logoUrl;
}

// Lets i18n this soon
function findEnRating(
  data: { iso_3166_1: string; release_dates: { certification: string }[] }[],
): string | false {
  let rating: string | false = false;
  data.forEach((item) => {
    if (item.iso_3166_1 === 'US') {
      rating = item.release_dates[0].certification;
    }
  });
  return rating;
}

export async function discoverMovie(page = 1, params = {}) {
  const tmdb = 'https://api.themoviedb.org/3/';
  let par = '';
  Object.keys(params).forEach((i) => {
    par += `&${i}=${params[i]}`;
  });
  const url = `${tmdb}discover/movie?api_key=${TMDB_API_KEY}${par}&page=${page}&append_to_response=videos`;
  const res = await axios.get(url, { httpAgent: agent });
  if (res.data && res.data.results.length > 0) {
    await Promise.all(
      res.data.results.map(async (movie: MovieData) => {
        const check: any = await onServer('movie', false, false, movie.id);
        movie.on_server = check.exists;
      }),
    );
  }
  return res.data;
}

interface CompanyData {
  id: number;
  [x: string]: any;
}

export async function company(id: number): Promise<CompanyData> {
  const tmdb = 'https://api.themoviedb.org/3/';
  const url = `${tmdb}company/${id}?api_key=${TMDB_API_KEY}`;
  const res: AxiosResponse<CompanyData> = await axios.get(url, {
    httpAgent: agent,
  });
  return res.data;
}
