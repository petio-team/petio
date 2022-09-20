import Promise from 'bluebird';
import cacheManager from 'cache-manager';
import request from 'xhr-request';

import env from '@/config/env';
import externalConfig from "@/config/env/external";
import { config } from '@/config/schema';
import logger from '@/loaders/logger';
import Discovery from '@/models/discovery';
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

const memoryCache = cacheManager.caching({
  store: 'memory',
  // max: 500,
  ttl: 3600 /* seconds */,
});

export default async (id, type = 'movie') => {
  if (!id) return { error: 'No ID' };
  try {
    const discoveryPrefs: any = await Discovery.findOne({ id }).exec();
    const popular: any = [];
    const [upcoming, popularData]: any = await Promise.all([
      comingSoon(type),
      getTop(type === 'movie' ? 1 : 2),
    ]);
    const plr = config.get('general.popular');
    if (plr || plr === null || plr === undefined) {
      for (const p in popularData) {
        popular.push(popularData[p]);
      }
    }
    if (!discoveryPrefs) {
      logger.verbose(
        `DISC: No user data yet for ${id} - this is likely still being built, generic discovery returned`,
        { label: 'discovery.build' },
      );
      return [
        {
          title:
            type === 'movie'
              ? 'Popular Movies on Plex'
              : 'Popular Shows on Plex',
          results: popular,
        },
        {
          title: type === 'movie' ? 'Movies coming soon' : 'Shows coming soon',
          results: upcoming.results,
        },
      ];
    }
    const watchHistory =
      type === 'movie'
        ? discoveryPrefs.movie.history
        : discoveryPrefs.series.history;
    const mediaGenres =
      type === 'movie'
        ? discoveryPrefs.movie.genres
        : discoveryPrefs.series.genres;
    const mediaActors =
      type === 'movie'
        ? discoveryPrefs.movie.people.cast
        : discoveryPrefs.series.people.cast;
    const mediaDirectors =
      type === 'movie'
        ? discoveryPrefs.movie.people.director
        : discoveryPrefs.series.people.director;
    const genresSorted: any = [];
    const actorsSorted: any = [];
    const directorsSorted: any = [];
    for (const genre in mediaGenres) {
      genresSorted.push(mediaGenres[genre]);
    }
    genresSorted.sort((a, b) => {
      if (a.count > b.count) {
        return -1;
      }
    });
    genresSorted.length = 4;
    const genreList: any = [];
    const genresData = await Promise.all(
      genresSorted.map(async (genre) => {
        const id: any = genreID(genre.name, type);
        if (!id || genreList.includes(id)) {
          return null;
        }
        genreList.push(id);
        const discData: any = await genreLookup(id, genre, type);

        if (!discData) return null;

        const results = await Promise.all(
          discData.map(async (result) => {
            if (!watchHistory[result.id]) {
              let onPlex: any = await onServer(type, false, false, result.id);
              if (!onPlex) onPlex = { exists: false };
              result = formatResult(result, type);
              result.on_server = onPlex.exists;
              return result;
            }
              return 'watched';

          }),
        );

        return {
          title: `${genre.name} ${
            type === 'movie' ? 'movies' : 'shows'
          } you might like`,
          results,
          genre_id: id,
          ratings: `${genre.lowestRating} - ${genre.highestRating}`,
        };
      }),
    );
    for (const actor in mediaActors) {
      actorsSorted.push({ name: actor, count: mediaActors[actor] });
    }
    actorsSorted.sort((a, b) => {
      if (a.count > b.count) {
        return -1;
      }
    });
    if (actorsSorted.length > 4) actorsSorted.length = 4;
    const peopleData = await Promise.all(
      actorsSorted.map(async (actor) => {
        const lookup: any = await searchPeople(actor.name);
        if (lookup.results && lookup.results.length > 0) {
          const match = lookup.results[0];
          const discData: any = await actorLookup(match, type);

          const newDisc = await Promise.all(
            discData.map(async (result, i) => {
              if (!watchHistory[result.id]) {
                const onPlex: any = await onServer(type, false, false, result.id);
                result = formatResult(result, type);
                result.on_server = onPlex.exists;
                return result;
              }
                return 'watched';

            }),
          );

          return {
            title: `"${match.name}" ${type === 'movie' ? 'movies' : 'shows'}`,
            results: newDisc,
          };
        }
      }),
    );

    for (const director in mediaDirectors) {
      directorsSorted.push({ name: director, count: mediaDirectors[director] });
    }
    directorsSorted.sort((a, b) => {
      if (a.count > b.count) {
        return -1;
      }
    });
    if (directorsSorted.length > 4) directorsSorted.length = 4;
    const directorData = await Promise.all(
      directorsSorted.map(async (director) => {
        const lookup: any = await searchPeople(director.name);
        if (lookup.results && lookup.results.length > 0) {
          const match = lookup.results[0];
          const discData: any = await actorLookup(match, type);

          const newDisc = await Promise.all(
            discData.map(async (result, i) => {
              if (!watchHistory[result.id]) {
                const onPlex: any = await onServer(type, false, false, result.id);
                result = formatResult(result, type);
                result.on_server = onPlex.exists;
                return result;
              }
                return 'watched';

            }),
          );

          return {
            title: `"${match.name}" ${type === 'movie' ? 'movies' : 'shows'}`,
            results: newDisc,
          };
        }
      }),
    );
    const recentlyViewed = await getHistory(id, type);
    const recentData: any = await Promise.map(
      Object.keys(recentlyViewed).slice(0, 5),
      async (r) => {
        const recent = recentlyViewed[r];
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
            recommendations.results.map(async (result) => {
              if (!(result.id.toString() in watchHistory)) {
                const onPlex: any = await onServer(type, false, false, result.id);
                result = formatResult(result, type);
                result.on_server = onPlex.exists;
                newRelated.push(result);
              }
            });
            return {
              title: `Because you watched "${recent.title || recent.name}"`,
              results: newRelated,
            };
          }
            const newRelated: any = [];
            related.results.map(async (result, i) => {
              if (!(result.id.toString() in watchHistory)) {
                const onPlex: any = await onServer(type, false, false, result.id);
                result = formatResult(result, type);
                result.on_server = onPlex.exists;
                newRelated.push(result);
              }
            });
            return {
              title: `Because you watched "${recent.title || recent.name}"`,
              results: newRelated,
            };

        }
      },
      { concurrency: config.get('general.concurrency') },
    );
    let data = [...peopleData, ...directorData, ...recentData, ...genresData];
    data = shuffle(data);
    return [
      {
        title:
          type === 'movie' ? 'Popular Movies on Plex' : 'Popular Shows on Plex',
        results: popular,
      },
      {
        title: type === 'movie' ? 'Movies coming soon' : 'Shows coming soon',
        results: upcoming.results,
      },
      ...data,
    ];
  } catch (err) {
    logger.error(`Error building ${type} discovery`, {
      label: 'discovery.build',
    });
    logger.error(err, { label: 'discovery.build' });
  }
};

async function genreLookup(id, genre, type) {
  let data = false;
  try {
    data = await memoryCache.wrap(`gl__${id}__${type}`, () => genreLookupData(id, genre, type));
  } catch (err) {
    logger.error(`Error getting genre data`, { label: 'discovery.build' });
    logger.error(err, { label: 'discovery.build' });
  }
  return data;
}

async function actorLookup(match, type) {
  let data = false;
  try {
    data = await memoryCache.wrap(`al__${match.id}__${type}`, () => actorLookupData(match, type));
  } catch (err) {
    logger.error(`Error getting actor data`, { label: 'discovery.build' });
    logger.error(err, { label: 'discovery.build' });
  }
  return data;
}

async function actorLookupData(match, type) {
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
  discData.results.sort((a, b) => {
    if (a.vote_average > b.vote_average) {
      return -1;
    }
  });
  return discData.results;
}

async function genreLookupData(id, genre, type) {
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
  discData.results.sort((a, b) => {
    if (a.vote_count > b.vote_count) {
      return -1;
    }
  });
  return discData.results;
}

function genreID(genreName, type) {
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
        logger.verbose(`DISC: Genre not mapped ${genreName}`, {
          label: 'discovery.build',
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
        logger.verbose(`DISC: Genre not mapped ${genreName}`, {
          label: 'discovery.build',
        });
        return false;
    }
  }
}
function discoverMovie(page = 1, params = {}) {
  const tmdb = 'https://api.themoviedb.org/3/';
  let par = '';
  Object.keys(params).forEach((i) => {
    par += `&${i}=${params[i]}`;
  });
  const url = `${tmdb}discover/movie?api_key=${externalConfig.tmdbApiKey}${par}&page=${page}&append_to_response=videos`;
  return new Promise((resolve, reject) => {
    request(
      url,
      {
        method: 'GET',
        json: true,
      },
      (err, data) => {
        if (err) {
          reject(err);
        }

        resolve(data);
      },
    );
  });
}

function discoverShow(page = 1, params = {}) {
  const tmdb = 'https://api.themoviedb.org/3/';
  let par = '';
  Object.keys(params).forEach((i) => {
    par += `&${i}=${params[i]}`;
  });
  const url = `${tmdb}discover/tv?api_key=${externalConfig.tmdbApiKey}${par}&page=${page}&append_to_response=videos`;
  return new Promise((resolve, reject) => {
    request(
      url,
      {
        method: 'GET',
        json: true,
      },
      (err, data) => {
        if (err) {
          reject(err);
        }

        resolve(data);
      },
    );
  });
}
function searchPeople(term) {
  const tmdb = 'https://api.themoviedb.org/3/';
  const url = `${tmdb}search/person?query=${term}&include_adult=false&api_key=${externalConfig.tmdbApiKey}`;
  return new Promise((resolve, reject) => {
    request(
      url,
      {
        method: 'GET',
        json: true,
      },
      (err, data) => {
        if (err) {
          reject(err);
        }

        resolve(data);
      },
    );
  });
}

function shuffle(array) {
  let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function formatResult(result, type) {
  if (type === 'movie') {
    delete result.credits;
    delete result.backdrop_path;
    delete result.belongs_to_collection;
    delete result.genres;
    delete result.homepage;
    delete result.popularity;
    delete result.recommendations;
    delete result.revenue;
    delete result.runtime;
    delete result.spoken_languages;
    delete result.status;
    delete result.tagline;
    delete result.vote_average;
    delete result.vote_count;
    delete result.adult;
    delete result.backdrop_path;
    delete result.genre_ids;
    delete result.original_language;
    delete result.overview;
  } else {
    delete result.created_by;
    delete result.credits;
    delete result.genres;
    delete result.in_production;
    delete result.last_air_date;
    delete result.next_episode_to_air;
    delete result.number_of_episodes;
    delete result.number_of_seasons;
    delete result.origin_country;
    delete result.original_name;
    delete result.overview;
    delete result.popularity;
    delete result.status;
    delete result.vote_average;
    delete result.vote_count;
    delete result.seasons;
    delete result.age_rating;
    delete result.backdrop_path;
    delete result.episode_run_time;
    delete result.imdb_id;
    delete result.keywords;
    delete result.last_episode_to_air;
    delete result.networks;
    delete result.original_language;
    delete result.spoken_languages;
    delete result.tagline;
    delete result.type;
  }

  return result;
}

async function comingSoon(type) {
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
    await Promise.map(
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
      { concurrency: config.get('general.concurrency') },
    );
    return data;
  } catch (e) {
    logger.error(e, { label: 'discovery.build' });
    return [];
  }
}
