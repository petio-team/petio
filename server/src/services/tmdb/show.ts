/* eslint-disable no-param-reassign */

/* eslint-disable @typescript-eslint/no-use-before-define */

/* eslint-disable no-restricted-syntax */
import { getFromContainer } from '@/infrastructure/container/container';
import { TheMovieDatabaseApiClient } from '@/infrastructure/generated/clients';
import {
  MovieDetailsResponse,
  MovieVideosResponse,
  TvSeriesDetailsResponse,
  TvSeriesVideosResponse,
} from '@/infrastructure/generated/tmdb-api-client';
import loggerMain from '@/infrastructure/logger/logger';
import { CacheProvider } from '@/services/cache/cache-provider';
import fanartLookup from '@/services/fanart';
import { lookup as imdb } from '@/services/meta/imdb';
import onServer from '@/services/plex/server';
import getLanguage from '@/services/tmdb/languages';

const logger = loggerMain.child({ module: 'tmdb.show' });

export async function showLookup(id, minified = false) {
  if (!id || id === 'false') {
    return 'No ID';
  }
  logger.debug(`TMDB Show Lookup ${id}`);
  const external: any = await externalId(id);
  let show: any = false;
  let data: any;
  try {
    data = await getShowData(id);
    show = { ...data };
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
        // eslint-disable-next-line prefer-const
        imdbData,
        // eslint-disable-next-line prefer-const
        fanart,
        recommendations,
        // eslint-disable-next-line prefer-const
        similar,
        // eslint-disable-next-line prefer-const
        seasonsLookup,
        // eslint-disable-next-line prefer-const
        reviews,
        // eslint-disable-next-line prefer-const
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

      show.imdb_data = imdbData;
      show.imdb_id = external.imdb_id;
      show.tvdb_id = external.tvdb_id;
      show.on_server = onPlex.exists;
      show.videos = {
        results: [
          ...show.videos.results.filter(
            (obj: { type: string; site: string }) =>
              obj.type === 'Trailer' && obj.site === 'YouTube',
          ),
          ...show.videos.results.filter(
            (obj: { type: string; site: string }) =>
              obj.type === 'Teaser' && obj.site === 'YouTube',
          ),
        ],
      };
      delete show.production_companies;
      delete show.homepage;
      delete show.languages;
      if (!minified) {
        show.server_seasons = onPlex.seasons;
        const seasons = { ...seasonsLookup };
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
      logger.warn(`Error processing show data - ${id}`, err);
      return { error: 'not found' };
    }
  }
  return { error: 'not found' };
}
export default showLookup;

// Caching Layer

// Get show details via the tmdbid
export const getShowDetails = async (id: number) => {
  const client = getFromContainer(TheMovieDatabaseApiClient);
  try {
    const [details, plex] = await Promise.all([
      client.default.tvSeriesDetails({
        seriesId: id,
        appendToResponse: 'videos',
      }),
      onServer('show', undefined, undefined, id),
    ]);

    let exists = false;
    if (plex && plex.exists) {
      exists = true;
    }
    const tvDetails = details as TvSeriesDetailsResponse & {
      videos: TvSeriesVideosResponse | undefined;
    };

    return {
      on_server: exists,
      name: details.name,
      poster_path: details.poster_path,
      first_air_date: details.first_air_date,
      id: details.id,
      backdrop_path: details.backdrop_path,
      videos:
        tvDetails.videos && tvDetails.videos.results
          ? {
              results: [
                ...tvDetails.videos.results.filter(
                  (obj) => obj.type === 'Teaser' && obj.site === 'YouTube',
                ),
                ...tvDetails.videos.results.filter(
                  (obj) => obj.type === 'Trailer' && obj.site === 'YouTube',
                ),
              ],
            }
          : [],
    };
  } catch (e) {
    logger.error(`failed to get show details with id ${id}`, e);
    return {};
  }
};

// Get movie details via the tmdbid
export const getMovieDetails = async (id: number) => {
  const client = getFromContainer(TheMovieDatabaseApiClient);
  try {
    const [details, plex] = await Promise.all([
      client.default.movieDetails({
        movieId: id,
        appendToResponse: 'videos',
      }),
      onServer('movie', undefined, undefined, id),
    ]);
    const movieDetails = details as MovieDetailsResponse & {
      videos: MovieVideosResponse | undefined;
    };

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
      videos:
        movieDetails.videos && movieDetails.videos.results
          ? {
              results: [
                ...movieDetails.videos.results.filter(
                  (obj) => obj.type === 'Teaser' && obj.site === 'YouTube',
                ),
                ...movieDetails.videos.results.filter(
                  (obj) => obj.type === 'Trailer' && obj.site === 'YouTube',
                ),
              ],
            }
          : [],
    };
  } catch (e) {
    logger.error(`failed to get movie details with id ${id}`, e);
    return {};
  }
};

async function getShowData(id) {
  try {
    return await getFromContainer(CacheProvider).wrap(id, async () =>
      tmdbData(id),
    );
  } catch (err) {
    logger.warn(`Error getting show data - ${id}`, err);
    return undefined;
  }
}

async function externalId(id) {
  try {
    return await getFromContainer(CacheProvider).wrap(`ext_${id}`, async () =>
      idLookup(id),
    );
  } catch (err) {
    logger.debug(`Error getting external ID - ${id}`, err);
    return undefined;
  }
}

export async function getRecommendations(id, page = 1) {
  try {
    return await getFromContainer(CacheProvider).wrap(
      `rec_${id}__${page}`,
      async () => recommendationData(id, page),
    );
  } catch (err) {
    logger.warn(`Error getting recommendation data - ${id}`, err);
    return undefined;
  }
}

export async function getSimilar(id, page = 1) {
  try {
    return await getFromContainer(CacheProvider).wrap(
      `similar_${id}__${page}`,
      async () => similarData(id, page),
    );
  } catch (err) {
    logger.warn(`Error getting similar data - ${id}`, err);
    return undefined;
  }
}

async function getReviews(id) {
  try {
    return await getFromContainer(CacheProvider).wrap(`rev_${id}`, async () =>
      reviewsData(id),
    );
  } catch (err) {
    logger.warn(`Error getting review data - ${id}`, err);
    return undefined;
  }
}

async function getSeasons(seasons, id) {
  let data: any = false;
  try {
    data = await getFromContainer(CacheProvider).wrap(
      `seasons_${id}`,
      async () => seasonsData(seasons, id),
    );
  } catch (err) {
    logger.warn(`Error getting season data - ${id}`, err);
  }
  return data;
}

// Lookup layer

async function tmdbData(id) {
  const client = getFromContainer(TheMovieDatabaseApiClient);
  try {
    const details = (await client.default.tvSeriesDetails({
      seriesId: id,
      appendToResponse:
        'aggregate_credits,videos,keywords,content_ratings,credits',
    })) as any;
    if (details.aggregate_credits) {
      if (details.aggregate_credits.cast.length > 50) {
        details.aggregate_credits.cast.length = 50;
      }
      details.credits.cast = [];
      details.aggregate_credits.cast.forEach((item, i) => {
        const character =
          item.roles.length > 0 ? item.roles[0].character : false;
        details.credits.cast[i] = {
          name: item.name,
          profile_path: item.profile_path,
          character,
          id: item.id,
        };
      });
      delete details.aggregate_credits;
    }
    if (details.content_ratings) {
      details.age_rating = findEnRating(details.content_ratings.results);
      delete details.content_ratings;
    }
    return details;
  } catch (e) {
    logger.error(`failed to get show details with id ${id}`, e);
    return {};
  }
}

async function recommendationData(id, page = 1) {
  const client = getFromContainer(TheMovieDatabaseApiClient);
  return client.default.tvSeriesRecommendations({
    seriesId: id,
    page,
  });
}

async function similarData(id, page = 1) {
  const client = getFromContainer(TheMovieDatabaseApiClient);
  return client.default.tvSeriesSimilar({
    seriesId: id,
    page,
  });
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
  const client = getFromContainer(TheMovieDatabaseApiClient);
  return client.default.tvSeasonDetails({
    seriesId: id,
    seasonNumber: season,
  });
}

async function reviewsData(id) {
  const client = getFromContainer(TheMovieDatabaseApiClient);
  return client.default.tvSeriesReviews({
    seriesId: id,
  });
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
  const client = getFromContainer(TheMovieDatabaseApiClient);
  return client.default.tvSeriesExternalIds({
    seriesId: id,
  });
}

export async function discoverSeries(page = 1, params = {}) {
  const client = getFromContainer(TheMovieDatabaseApiClient);
  const data = (await client.default.discoverTv({
    page,
    ...params,
  })) as any;
  if (data && data.results.length > 0) {
    await Promise.all(
      data.results.map(async (show) => {
        const check: any = await onServer('show', false, false, show.id);
        show.on_server = check.exists;
      }),
    );
  }
  return data;
}

export async function network(id) {
  const client = getFromContainer(TheMovieDatabaseApiClient);
  return client.default.networkDetails({
    networkId: id,
  });
}
