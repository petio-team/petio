import http from 'http';
import axios from 'axios';

import cache from "../cache/cache";
import externalConfig from "@/config/env/external";
import { TMDBAPI } from '@/infra/tmdb/tmdb';
import logger from '@/loaders/logger';
import fanartLookup from '@/services/fanart';
import { lookup as imdb } from '@/services/meta/imdb';
import onServer from '@/services/plex/server';
import getLanguage from '@/services/tmdb/languages';

const agent = new http.Agent({ family: 4 });

export async function showLookup(id, minified = false) {
  if (!id || id == 'false') {
    return 'No ID';
  }
  logger.debug(`TMDB Show Lookup ${id}`, {
    label: 'tmdb.show',
  });
  const external: any = await externalId(id);
  let show: any = false;
  let data: any;
  try {
    data = await getShowData(id);
    show = { ...data};
  } catch {
    return { error: 'not found' };
  }
  if (show.success === false) {
    return { error: 'not found' };
  }
  if (show) {
    if (!show.id) {
      return { error: 'no id returned' };
    }

    try {
      let [
        imdb_data,
        fanart,
        recommendations,
        similar,
        seasonsLookup,
        reviews,
        onPlex,
      ]: any = await Promise.all([
        !minified && external.imdb_id ? imdb(external.imdb_id) : false,
        minified ? false : fanartLookup(external.tvdb_id, 'tv'),
        !minified ? getRecommendations(id) : false,
        !minified ? getSimilar(id) : false,
        !minified ? getSeasons(show.seasons, id) : false,
        !minified ? getReviews(id) : false,
        onServer('show', external.imdb_id, external.tvdb_id, id),
      ]);

      if (fanart) {
        if (fanart.hdtvlogo) {
          show.logo = findEnLogo(fanart.hdtvlogo);
        }
        if (fanart.tvthumb) {
          show.tile = findEnLogo(fanart.tvthumb);
        }
      }

      show.imdb_data = imdb_data;
      show.imdb_id = external.imdb_id;
      show.tvdb_id = external.tvdb_id;
      show.on_server = onPlex.exists;
      show.videos = {
        results: [
          ...show.videos.results.filter(
            (obj) => obj.type == 'Trailer' && obj.site == 'YouTube',
          ),
          ...show.videos.results.filter(
            (obj) => obj.type == 'Teaser' && obj.site == 'YouTube',
          ),
        ],
      };
      delete show.production_companies;
      delete show.homepage;
      delete show.languages;
      if (!minified) {
        show.server_seasons = onPlex.seasons;
        const seasons = { ...seasonsLookup};
        const seasonData = {};
        const recommendationsData: any = [];
        Object.keys(seasons).forEach((key) => {
          const season = seasons[key];
          Object.keys(season.episodes).forEach((ep) => {
            delete season.episodes[ep].guest_stars;
            delete season.episodes[ep].crew;
            delete season.episodes[ep].production_code;
            delete season.episodes[ep].show_id;
          });
          seasonData[season.season_number] = season;
        });

        if (
          recommendations.results.length === 0 &&
          similar.results.length === 0
        ) {
          const params: any = {};
          if (show.genres) {
            let genres = '';
            for (const element of show.genres) {
              genres += `${element.id},`;
            }

            params.with_genres = genres;
          }
          recommendations = await discoverSeries(1, params);
        }
        if (recommendations)
          Object.keys(recommendations.results).forEach((key) => {
            const recommendation = recommendations.results[key];
            if (recommendation.id !== parseInt(id))
              recommendationsData.push(recommendation.id);
          });
        if (similar)
          Object.keys(similar.results).forEach((key) => {
            const recommendation = similar.results[key];
            if (
              recommendation.id !== parseInt(id) &&
              !recommendationsData.includes(recommendation.id)
            )
              recommendationsData.push(recommendation.id);
          });
        show.seasonData = seasonData;
        show.recommendations = recommendationsData;
        show.reviews = reviews.results;
        show.keywords = show.keywords.results;
      }

      if (minified) {
        delete show.created_by;
        delete show.credits;
        delete show.genres;
        delete show.in_production;
        delete show.last_air_date;
        delete show.next_episode_to_air;
        delete show.number_of_episodes;
        delete show.number_of_seasons;
        delete show.origin_country;
        delete show.original_name;
        delete show.overview;
        delete show.popularity;
        delete show.status;
        delete show.vote_average;
        delete show.vote_count;
        delete show.seasons;
        delete show.age_rating;
        delete show.episode_run_time;
        delete show.imdb_id;
        delete show.last_episode_to_air;
        delete show.networks;
        delete show.original_language;
        delete show.spoken_languages;
        delete show.tagline;
        delete show.type;
      } else {
        show.original_language_format = getLanguage(show.original_language);
      }

      return show;
    } catch (err) {
      logger.warn(`Error processing show data - ${id}`, {
        label: 'tmdb.show',
      });
      logger.error(err, { label: 'tmdb.show' });
      return { error: 'not found' };
    }
  }
}
export default showLookup;

// Caching Layer

// Get show details via the tmdbid
export const getShowDetails = async (id: number) => {
  try {
    const [details, plex] = await Promise.all([
      TMDBAPI.get('/tv/:id', {
        params: {
          id,
        },
        queries: {
          append_to_response: 'videos',
        },
      }),
      onServer('show', undefined, undefined, id),
    ]);

    let exists = false;
    if (plex && plex.exists) {
      exists = true;
    }

    return {
      on_server: exists,
      name: details.name,
      poster_path: details.poster_path,
      first_air_date: details.first_air_date,
      id: details.id,
      backdrop_path: details.backdrop_path,
      videos: details.videos
        ? {
            results: [
              ...details.videos.results.filter(
                (obj) => obj.type == 'Teaser' && obj.site == 'YouTube',
              ),
              ...details.videos.results.filter(
                (obj) => obj.type == 'Trailer' && obj.site == 'YouTube',
              ),
            ],
          }
        : [],
    };
  } catch (e) {
    logger.error(e);
  }
};

// Get movie details via the tmdbid
export const getMovieDetails = async (id: number) => {
  try {
    const [details, plex] = await Promise.all([
      TMDBAPI.get('/movie/:id', {
        params: {
          id,
        },
        queries: {
          append_to_response: 'videos',
        },
      }),
      onServer('movie', undefined, undefined, id),
    ]);

    let exists = false;
    if (plex && plex.exists) {
      exists = true;
    }

    return {
      on_server: exists,
      name: details.title,
      poster_path: details.poster_path,
      release_date: details.release_date,
      id: details.id,
      backdrop_path: details.backdrop_path,
      videos: details.videos
        ? {
            results: [
              ...details.videos.results.filter(
                (obj) => obj.type == 'Teaser' && obj.site == 'YouTube',
              ),
              ...details.videos.results.filter(
                (obj) => obj.type == 'Trailer' && obj.site == 'YouTube',
              ),
            ],
          }
        : [],
    };
  } catch (e) {
    logger.error(e);
  }
};

async function getShowData(id) {
  let data = false;
  try {
    data = await cache.wrap(id, async () => tmdbData(id));
  } catch (err) {
    logger.warn(`Error getting show data - ${id}`, {
      label: 'tmdb.show',
    });
    logger.error(err, { label: 'tmdb.show' });
  }
  return data;
}

async function externalId(id) {
  let data = false;
  try {
    data = await cache.wrap(`ext_${id}`, async () => idLookup(id));
  } catch (err) {
    logger.verbose(`Error getting external ID - ${id}`, {
      label: 'tmdb.show',
    });
    logger.debug(err, { label: 'tmdb.show' });
  }
  return data;
}

export async function getRecommendations(id, page = 1) {
  let data = false;
  try {
    data = await cache.wrap(`rec_${id}__${page}`, async () => recommendationData(id, page));
  } catch (err) {
    logger.warn(`Error getting recommendation data - ${id}`, {
      label: 'tmdb.show',
    });
    logger.error(err, { label: 'tmdb.show' });
  }
  return data;
}

export async function getSimilar(id, page = 1) {
  let data = false;
  try {
    data = await cache.wrap(`similar_${id}__${page}`, async () => similarData(id, page));
  } catch (err) {
    logger.warn(`Error getting similar data - ${id}`, {
      label: 'tmdb.show',
    });
    logger.error(err, { label: 'tmdb.show' });
  }
  return data;
}

async function getReviews(id) {
  let data = false;
  try {
    data = await cache.wrap(`rev_${id}`, async () => reviewsData(id));
  } catch (err) {
    logger.warn(`Error getting review data - ${id}`, {
      label: 'tmdb.show',
    });
    logger.error(err, { label: 'tmdb.show' });
  }
  return data;
}

async function getSeasons(seasons, id) {
  let data: any = false;
  try {
    data = await cache.wrap(`seasons_${id}`, async () => seasonsData(seasons, id));
  } catch (err) {
    logger.warn(`Error getting season data - ${id}`, {
      label: 'tmdb.show',
    });
    logger.error(err, { label: 'tmdb.show' });
  }
  return data;
}

// Lookup layer

async function tmdbData(id) {
  const tmdb = 'https://api.themoviedb.org/3/';
  const url = `${tmdb}tv/${id}?api_key=${externalConfig.tmdbApiKey}&append_to_response=aggregate_credits,videos,keywords,content_ratings,credits`;
  const res = await axios.get(url, { httpAgent: agent });
  const {data} = res;
  if (data.aggregate_credits) {
    if (data.aggregate_credits.cast.length > 50)
      data.aggregate_credits.cast.length = 50;
    data.credits.cast = [];
    data.aggregate_credits.cast.map((item, i) => {
      const character = item.roles.length > 0 ? item.roles[0].character : false;
      data.credits.cast[i] = {
        name: item.name,
        profile_path: item.profile_path,
        character,
        id: item.id,
      };
    });
    delete data.aggregate_credits;
  }
  if (data.content_ratings) {
    data.age_rating = findEnRating(data.content_ratings.results);
    delete data.content_ratings;
  }
  return data;
}

async function recommendationData(id, page = 1) {
  const tmdb = 'https://api.themoviedb.org/3/';
  const url = `${tmdb}tv/${id}/recommendations?api_key=${externalConfig.tmdbApiKey}&page=${page}`;
  const res = await axios.get(url, { httpAgent: agent });
  return res.data;
}

async function similarData(id, page = 1) {
  const tmdb = 'https://api.themoviedb.org/3/';
  const url = `${tmdb}tv/${id}/similar?api_key=${externalConfig.tmdbApiKey}&page=${page}`;
  const res = await axios.get(url, { httpAgent: agent });
  return res.data;
}

async function seasonsData(seasons, id) {
  const seasonList: any = [];
  Object.keys(seasons).forEach((key) => {
    seasonList.push(seasons[key].season_number);
  });
  return seasonsAsync(seasonList, id);
}

async function seasonsAsync(seasonList, id) {
  return Promise.all(seasonList.map((item) => getSeason(id, item)));
}

async function getSeason(id, season) {
  const tmdb = 'https://api.themoviedb.org/3/';
  const url = `${tmdb}tv/${id}/season/${season}?api_key=${externalConfig.tmdbApiKey}`;
  const res = await axios.get(url, { httpAgent: agent });
  return res.data;
}

async function reviewsData(id) {
  const tmdb = 'https://api.themoviedb.org/3/';
  const url = `${tmdb}tv/${id}/reviews?api_key=${externalConfig.tmdbApiKey}`;
  const res = await axios.get(url, { httpAgent: agent });
  return res.data;
}

// Lets i18n this soon
function findEnLogo(logos) {
  let logoUrl = false;
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
function findEnRating(data) {
  let rating = false;
  data.forEach((item) => {
    if (item.iso_3166_1 === 'US') {
      rating = item.rating;
    }
  });
  return rating;
}

async function idLookup(id) {
  const tmdb = 'https://api.themoviedb.org/3/';
  const url = `${tmdb}tv/${id}/external_ids?api_key=${externalConfig.tmdbApiKey}`;
  try {
    const res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    logger.error(`failed to look up show ${id}`, { label: 'tmdb.show' });
    logger.error(err, { label: 'tmdb.show' });
    throw err;
  }
}

export async function discoverSeries(page = 1, params = {}) {
  const tmdb = 'https://api.themoviedb.org/3/';
  let par = '';
  Object.keys(params).forEach((i) => {
    par += `&${i}=${params[i]}`;
  });
  const url = `${tmdb}discover/tv?api_key=${externalConfig.tmdbApiKey}${par}&page=${page}`;
  const res = await axios.get(url, { httpAgent: agent });
  if (res.data && res.data.results.length > 0) {
    await Promise.all(
      res.data.results.map(async (show) => {
        const check: any = await onServer('show', false, false, show.id);
        show.on_server = check.exists;
      }),
    );
  }
  return res.data;
}

export async function network(id) {
  const tmdb = 'https://api.themoviedb.org/3/';
  const url = `${tmdb}network/${id}?api_key=${externalConfig.tmdbApiKey}`;
  const res = await axios.get(url, { httpAgent: agent });
  return res.data;
}
