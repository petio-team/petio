/* eslint-disable guard-for-in */

/* eslint-disable no-restricted-syntax */

/* eslint-disable @typescript-eslint/no-use-before-define */
import Bluebird from 'bluebird';

// eslint-disable-next-line import/order
import { getFromContainer } from '@/infrastructure/container/container';
import loggerMain from '@/infrastructure/logger/logger';
import { TheMovieDatabaseClient } from '@/infrastructure/tmdb/client';
import is from '@/infrastructure/utils/is';
import { DiscoveryRepository } from '@/resources/discovery/repository';
import { MediaServerRepository } from '@/resources/media-server/repository';
import { CacheService } from '@/services/cache/cache';
import getHistory from '@/services/plex/history';
import onServer from '@/services/plex/server';
import getTop from '@/services/plex/top';
import {
  getRecommendations as getMovieRecommendations,
  movieLookup,
} from '@/services/tmdb/movie';
import {
  getRecommendations as getShowRecommendations,
  showLookup,
} from '@/services/tmdb/show';

import { getPlexClient } from '../plex/client';

const logger = loggerMain.child({ module: 'discovery.display' });

export type DiscoveryResult = {
  popular: {
    title: string;
    results: {};
  };
  upcoming: {
    title: string;
    results: any[];
  };
  actors: {
    results: any[];
  };
  directors: {
    results: any[];
  };
  recentlyWatched: {
    results: any[];
  };
  genres: {
    results: any[];
  };
};

export function makeDiscoveryResult(
  contentType: string = 'movie',
  populars?: {},
  upcoming?: any[],
  actors?: any[],
  directors?: any[],
  recentlyWatched?: any[],
  genres?: any[],
): DiscoveryResult {
  const title = contentType === 'movie' ? 'Movies' : 'Shows';
  return {
    popular: {
      title: `Popular ${title} on Plex`,
      results: populars || {},
    },
    upcoming: {
      title: `Upcoming ${title} on Plex`,
      results: upcoming || [],
    },
    actors: {
      results: actors || [],
    },
    directors: {
      results: directors || [],
    },
    recentlyWatched: {
      results: recentlyWatched || [],
    },
    genres: {
      results: genres || [],
    },
  };
}

async function sortGenres(genres: any, type: string, watchHistory: any) {
  const mediaGenres = genres;
  const genresSorted: any = [];
  for (const genre in mediaGenres) {
    genresSorted.push(mediaGenres[genre]);
  }
  genresSorted.sort((a: { count: number }, b: { count: number }) => {
    if (a.count > b.count) {
      return -1;
    }
    return 1;
  });
  genresSorted.length = 4;
  const genreList: any = [];
  return Promise.all(
    genresSorted.map(
      async (genre: { name: any; lowestRating: any; highestRating: any }) => {
        const genreId: any = genreID(genre.name, type);
        if (!genreId || genreList.includes(genreId)) {
          return null;
        }
        genreList.push(genreId);
        const discData: any = await genreLookup(genreId, genre, type);

        if (!discData) return null;

        const results = await Promise.all(
          discData.map(
            async (result: { id: string | number; on_server: any }) => {
              let resultCopy = result;
              if (!watchHistory[result.id]) {
                let onPlex: any = await onServer(type, false, false, result.id);
                if (!onPlex) onPlex = { exists: false };
                resultCopy = formatResult(result, type);
                resultCopy.on_server = onPlex.exists;
                return result;
              }
              return 'watched';
            },
          ),
        );

        return {
          title: `${genre.name} ${
            type === 'movie' ? 'movies' : 'shows'
          } you might like`,
          results,
          genre_id: genreId,
          ratings: `${genre.lowestRating} - ${genre.highestRating}`,
        };
      },
    ),
  );
}

async function sortActors(actors: any, type: string, watchHistory: any) {
  const mediaActors = actors;
  const actorsSorted: any = [];
  for (const actor in mediaActors) {
    actorsSorted.push({ name: actor, count: mediaActors[actor] });
  }
  actorsSorted.sort((a: { count: number }, b: { count: number }) => {
    if (a.count > b.count) {
      return -1;
    }
    return 1;
  });
  if (actorsSorted.length > 4) actorsSorted.length = 4;
  return Promise.all(
    actorsSorted.map(async (actor: { name: any }) => {
      const lookup: any = await searchPeople(actor.name);
      if (lookup.results && lookup.results.length > 0) {
        const match = lookup.results[0];
        const discData: any = await actorLookup(match, type);

        if (!discData) return null;

        const newDisc = await Promise.all(
          discData.map(
            async (result: { id: string | number; on_server: any }) => {
              let resultCopy = result;
              if (!watchHistory[resultCopy.id]) {
                const onPlex: any = await onServer(
                  type,
                  false,
                  false,
                  resultCopy.id,
                );
                resultCopy = formatResult(result, type);
                resultCopy.on_server = onPlex.exists;
                return resultCopy;
              }
              return 'watched';
            },
          ),
        );

        return {
          title: `"${match.name}" ${type === 'movie' ? 'movies' : 'shows'}`,
          results: newDisc,
        };
      }
      return null;
    }),
  );
}

async function sortDirectors(directors: any, type: string, watchHistory: any) {
  const mediaDirectors = directors;
  const directorsSorted: any = [];
  for (const director in mediaDirectors) {
    directorsSorted.push({ name: director, count: mediaDirectors[director] });
  }
  directorsSorted.sort((a: { count: number }, b: { count: number }) => {
    if (a.count > b.count) {
      return -1;
    }
    return 1;
  });
  if (directorsSorted.length > 4) directorsSorted.length = 4;
  return Promise.all(
    directorsSorted.map(async (director: { name: any }) => {
      const lookup: any = await searchPeople(director.name);
      if (lookup.results && lookup.results.length > 0) {
        const match = lookup.results[0];
        const discData: any = await actorLookup(match, type);

        if (!discData) return null;

        const newDisc = await Promise.all(
          discData.map(
            async (result: { id: string | number; on_server: any }) => {
              let resultCopy = result;
              if (!watchHistory[result.id]) {
                const onPlex: any = await onServer(
                  type,
                  false,
                  false,
                  resultCopy.id,
                );
                resultCopy = formatResult(result, type);
                resultCopy.on_server = onPlex.exists;
                return resultCopy;
              }
              return 'watched';
            },
          ),
        );

        return {
          title: `"${match.name}" ${type === 'movie' ? 'movies' : 'shows'}`,
          results: newDisc,
        };
      }
      return null;
    }),
  );
}

async function buildRecentData(history: any, type: string, watchHistory: any) {
  return Bluebird.map(
    Object.keys(history).slice(0, 5),
    async (r: string | number) => {
      const recent = history[r];
      if (recent.id) {
        let related: any =
          type === 'movie'
            ? await Promise.all([
                getMovieRecommendations(recent.id, 1),
                getMovieRecommendations(recent.id, 2),
              ])
            : await Promise.all([
                getShowRecommendations(recent.id, 1),
                getShowRecommendations(recent.id, 2),
              ]);
        if (!related[0].results) related[0].results = [];
        if (!related[1].results) related[1].results = [];
        related = {
          results: [...related[0].results, ...related[1].results],
        };
        if (related.results.length === 0) {
          const lookup =
            type === 'movie'
              ? await movieLookup(recent.id, true)
              : await showLookup(recent.id, true);
          if (!lookup) return null;
          const params: any = {};
          if (lookup.genres) {
            let genres = '';
            // eslint-disable-next-line no-restricted-syntax
            for (const element of lookup.genres) {
              genres += `${element.id},`;
            }
            params.with_genres = genres;
          }
          const recommendations: any =
            type === 'movie'
              ? await discoverMovie(1, params)
              : await discoverShow(1, params);
          if (recommendations.results.length === 0) return null;
          const newRelated: any = [];
          recommendations.results.map(
            async (result: {
              id: { toString: () => string };
              on_server: any;
            }) => {
              let resultCopy = result;
              if (!(result.id.toString() in watchHistory)) {
                const onPlex: any = await onServer(
                  type,
                  false,
                  false,
                  result.id,
                );
                resultCopy = formatResult(result, type);
                resultCopy.on_server = onPlex.exists;
                newRelated.push(resultCopy);
              }
            },
          );
          return {
            title: `Because you watched "${recent.title || recent.name}"`,
            results: newRelated,
          };
        }
        const newRelated: any = [];
        related.results.map(
          async (result: {
            id: { toString: () => string };
            on_server: any;
          }) => {
            let resultCopy = result;
            if (!(result.id.toString() in watchHistory)) {
              const onPlex: any = await onServer(type, false, false, result.id);
              resultCopy = formatResult(result, type);
              resultCopy.on_server = onPlex.exists;
              newRelated.push(resultCopy);
            }
          },
        );
        return {
          title: `Because you watched "${recent.title || recent.name}"`,
          results: newRelated,
        };
      }
      return null;
    },
    { concurrency: 4 },
  );
}

export type DiscoveryContentType = 'movie' | 'show';
export default async (
  id: string,
  contentType: DiscoveryContentType = 'movie',
) => {
  logger.debug(`building display discovery for user ${id} - ${contentType}`);
  if (!id) {
    throw new Error('invalid media id');
  }
  const mediaServerRepo = getFromContainer(MediaServerRepository);
  const discoveryRepo = getFromContainer(DiscoveryRepository);
  try {
    const serverResult = await mediaServerRepo.findOne({});
    if (serverResult.isNone()) {
      logger.error(`no server found for discovery`);
      return makeDiscoveryResult();
    }
    const server = serverResult.unwrap();
    logger.debug({ id }, `user id used for displaying user content`);
    const [discoveryResult, upcoming, popular] = await Bluebird.all([
      discoveryRepo.findOne({ id }),
      comingSoon(contentType),
      getTop(server, contentType === 'movie' ? 1 : 2),
    ]);
    if (discoveryResult.isNone()) {
      logger.debug(
        `no user data yet for ${id} - this is likely still being built, generic discovery returned`,
      );
      return makeDiscoveryResult(contentType, popular, upcoming.results);
    }
    const discovery = discoveryResult.unwrap();
    const watchHistory =
      contentType === 'movie'
        ? discovery.movie.history
        : discovery.series.history;
    const mediaGenres =
      contentType === 'movie'
        ? discovery.movie.genres
        : discovery.series.genres;
    const mediaActors =
      contentType === 'movie'
        ? discovery.movie.people.cast
        : discovery.series.people.cast;
    const mediaDirectors =
      contentType === 'movie'
        ? discovery.movie.people.director
        : discovery.series.people.director;
    //
    const [generes, actors, directors, history] = await Bluebird.all([
      sortGenres(mediaGenres, contentType, watchHistory),
      sortActors(mediaActors, contentType, watchHistory),
      sortDirectors(mediaDirectors, contentType, watchHistory),
      getHistory(getPlexClient(server), id, contentType),
    ]);
    const recentData = await buildRecentData(
      history,
      contentType,
      watchHistory,
    );
    return makeDiscoveryResult(
      contentType,
      popular,
      upcoming.results,
      shuffle(actors.filter(is.truthy)),
      shuffle(directors.filter(is.truthy)),
      shuffle(recentData.filter(is.truthy)),
      shuffle(generes.filter(is.truthy)),
    );
  } catch (err) {
    logger.error(`Error building ${contentType} discovery`, err);
    return makeDiscoveryResult();
  }
};

async function genreLookup(id: any, genre: any, type: string) {
  let data = false;
  try {
    data = await getFromContainer(CacheService).wrap(`gl__${id}__${type}`, () =>
      genreLookupData(id, genre, type),
    );
  } catch (err) {
    logger.error(`Error getting genre data`, err);
  }
  return data;
}

async function actorLookup(match: { id: any }, type: string) {
  let data = false;
  try {
    data = await getFromContainer(CacheService).wrap(
      `al__${match.id}__${type}`,
      () => actorLookupData(match, type),
    );
  } catch (err) {
    logger.error(`Error getting actor data`, err);
  }
  return data;
}

async function actorLookupData(match: { id: any }, type: string) {
  const args = {
    sort_by: type === 'movie' ? 'revenue.desc' : 'popularity.desc',
    'vote_count.gte': 100,
    with_people: match.id,
  };
  let discData: any =
    type === 'movie'
      ? await Promise.all([discoverMovie(1, args), discoverMovie(2, args)])
      : await Promise.all([discoverShow(1, args), discoverShow(2, args)]);

  if (!discData[0].results) discData[0].results = [];
  if (!discData[1].results) discData[1].results = [];
  discData = {
    results: [...discData[0].results, ...discData[1].results],
  };
  discData.results.sort(
    (a: { vote_average: number }, b: { vote_average: number }) => {
      if (a.vote_average > b.vote_average) {
        return -1;
      }
      return 1;
    },
  );
  return discData.results;
}

async function genreLookupData(
  id: any,
  genre: {
    lowestRating: number;
    highestRating: number;
    cert: { [x: string]: number };
    count: number;
  },
  type: string,
) {
  const args: any = {
    with_genres: id,
    sort_by: type === 'movie' ? 'revenue.desc' : 'popularity.desc',
    'vote_count.gte': 1500,
    certification_country: 'US',
    'vote_average.gte':
      genre.lowestRating > 0.5 ? genre.lowestRating - 0.5 : genre.lowestRating,
  };
  if (type === 'movie') {
    args['vote_average.lte'] =
      genre.highestRating < 9.5
        ? genre.highestRating + 0.5
        : genre.highestRating;
  }
  const certifications: any = [];
  if (Object.keys(genre.cert).length > 0) {
    Object.keys(genre.cert).forEach((cert) => {
      // 10% threshold
      if (genre.count * 0.1 < genre.cert[cert]) {
        certifications.push(cert);
      }
    });
  }
  if (certifications.length > 0) args.certification = certifications.join('|');
  let discData: any =
    type === 'movie'
      ? await Promise.all([discoverMovie(1, args), discoverMovie(2, args)])
      : await Promise.all([discoverShow(1, args), discoverShow(2, args)]);

  if (!discData[0].results) discData[0].results = [];
  if (!discData[1].results) discData[1].results = [];
  discData = {
    results: [...discData[0].results, ...discData[1].results],
  };
  discData.results.sort(
    (a: { vote_count: number }, b: { vote_count: number }) => {
      if (a.vote_count > b.vote_count) {
        return -1;
      }
      return 1;
    },
  );
  return discData.results;
}

function genreID(genreName: any, type: string) {
  if (type === 'movie') {
    switch (genreName) {
      case 'Action':
        return 28;
      case 'Adventure':
      case 'Action/Adventure':
        return 12;
      case 'Animation':
        return 16;
      case 'Comedy':
        return 35;
      case 'Crime':
      case 'Film-Noir':
        return 80;
      case 'Documentary':
      case 'Factual':
        return 99;
      case 'Drama':
        return 18;
      case 'Family':
      case 'Kids':
      case 'Children':
        return 10751;
      case 'Fantasy':
        return 14;
      case 'History':
      case 'Biography':
        return 36;
      case 'Horror':
        return 27;
      case 'Music':
      case 'Musical':
        return 10402;
      case 'Mystery':
        return 9648;
      case 'Romance':
        return 10749;
      case 'Science Fiction':
      case 'Sci-Fi':
        return 878;
      case 'TV Movie':
        return 10770;
      case 'Thriller':
        return 53;
      case 'War':
        return 10752;
      case 'Western':
        return 37;

      default:
        logger.debug(`DISC: Genre not mapped ${genreName}`, {
          module: 'discovery.build',
        });
        return false;
    }
  } else {
    switch (genreName) {
      case 'Action & Adventure':
      case 'Adventure':
      case 'Action/Adventure':
      case 'Action':
        return 10759;
      case 'Animation':
        return 16;
      case 'Comedy':
        return 35;
      case 'Crime':
        return 80;
      case 'Documentary':
      case 'Factual':
      case 'Biography':
        return 99;
      case 'Drama':
        return 18;
      case 'Family':
        return 10751;
      case 'Kids':
      case 'Children':
        return 10762;
      case 'Mystery':
      case 'Horror':
      case 'Thriller':
      case 'Suspense':
        return 9648;
      case 'News':
        return 10763;
      case 'Reality':
      case 'Reality-TV':
        return 10764;
      case 'Sci-Fi & Fantasy':
      case 'Science Fiction':
      case 'Fantasy':
      case 'Sci-Fi':
        return 10765;
      case 'Soap':
        return 10766;
      case 'Talk':
        return 10767;
      case 'War':
      case 'War & Politics':
        return 10768;
      case 'Western':
        return 37;
      default:
        logger.debug(`DISC: Genre not mapped ${genreName}`, {
          module: 'discovery.build',
        });
        return false;
    }
  }
}

function discoverMovie(page = 1, params = {}) {
  return getFromContainer(TheMovieDatabaseClient).default.discoverMovie({
    page,
    ...params,
  });
}

function discoverShow(page = 1, params = {}) {
  return getFromContainer(TheMovieDatabaseClient).default.discoverTv({
    page,
    ...params,
  });
}

async function searchPeople(term: any) {
  return getFromContainer(TheMovieDatabaseClient).default.searchPerson({
    query: term,
  });
}

function shuffle(array: string[] | any[]) {
  const arrayCopy = array;
  let currentIndex = array.length;
  let temporaryValue: any;
  let randomIndex: number;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    arrayCopy[currentIndex] = array[randomIndex];
    arrayCopy[randomIndex] = temporaryValue;
  }

  return arrayCopy;
}

function formatResult(result: any, type: string): any {
  const resultCopy = result;
  if (type === 'movie') {
    delete resultCopy.credits;
    delete resultCopy.backdrop_path;
    delete resultCopy.belongs_to_collection;
    delete resultCopy.genres;
    delete resultCopy.homepage;
    delete resultCopy.popularity;
    delete resultCopy.recommendations;
    delete resultCopy.revenue;
    delete resultCopy.runtime;
    delete resultCopy.spoken_languages;
    delete resultCopy.status;
    delete resultCopy.tagline;
    delete resultCopy.vote_average;
    delete resultCopy.vote_count;
    delete resultCopy.adult;
    delete resultCopy.backdrop_path;
    delete resultCopy.genre_ids;
    delete resultCopy.original_language;
    delete resultCopy.overview;
  } else {
    delete resultCopy.created_by;
    delete resultCopy.credits;
    delete resultCopy.genres;
    delete resultCopy.in_production;
    delete resultCopy.last_air_date;
    delete resultCopy.next_episode_to_air;
    delete resultCopy.number_of_episodes;
    delete resultCopy.number_of_seasons;
    delete resultCopy.origin_country;
    delete resultCopy.original_name;
    delete resultCopy.overview;
    delete resultCopy.popularity;
    delete resultCopy.status;
    delete resultCopy.vote_average;
    delete resultCopy.vote_count;
    delete resultCopy.seasons;
    delete resultCopy.age_rating;
    delete resultCopy.backdrop_path;
    delete resultCopy.episode_run_time;
    delete resultCopy.imdb_id;
    delete resultCopy.keywords;
    delete resultCopy.last_episode_to_air;
    delete resultCopy.networks;
    delete resultCopy.original_language;
    delete resultCopy.spoken_languages;
    delete resultCopy.tagline;
    delete resultCopy.type;
  }

  return result;
}

async function comingSoon(type: string) {
  const now = new Date().toISOString().split('T')[0];
  try {
    const data: any =
      type === 'movie'
        ? await discoverMovie(1, {
            sort_by: 'popularity.desc',
            'primary_release_date.gte': now,
            with_original_language: 'en',
          })
        : await discoverShow(1, {
            sort_by: 'popularity.desc',
            'first_air_date.gte': now,
            with_original_language: 'en',
          });
    await Bluebird.map(
      data.results,
      async (result: any, i) => {
        const onPlex: any =
          type === 'movie'
            ? await onServer('movie', false, false, result.id)
            : await onServer('show', false, false, result.id);

        data.results[i] =
          type === 'movie'
            ? {
                on_server: onPlex.exists,
                title: result.title,
                poster_path: result.poster_path,
                release_date: result.release_date,
                id: result.id,
                videos: result.videos,
              }
            : {
                on_server: onPlex.exists,
                name: result.name,
                poster_path: result.poster_path,
                first_air_date: result.first_air_date,
                id: result.id,
                videos: result.videos,
              };
      },
      { concurrency: 1 },
    );
    return data;
  } catch (error) {
    logger.error(error, `failed to get coming soon data`);
    return [];
  }
}
