import bluebird from 'bluebird';
import cacheManager from 'cache-manager';

import { TMDBAPI } from '@/infra/tmdb/tmdb';
import {
  MediaType,
  TimeWindow,
  TrendingMovie,
  TrendingPeople,
  TrendingTv,
} from '@/infra/tmdb/trending/trending';
import logger from '@/loaders/logger';

import { getMovieDetails, getShowDetails } from './show';

const memoryCache = cacheManager.caching({
  store: 'memory',
  max: 3,
  ttl: 86400 /*seconds*/,
});

const Companies = [
  {
    id: 2,
    logo_path: '/wdrCwmRnLFJhEoH8GSfymY85KHT.png',
    name: 'Walt Disney Pictures',
  },
  {
    id: 33,
    logo_path: '/8lvHyhjr8oUKOOy2dKXoALWKdp0.png',
    name: 'Universal Pictures',
  },
  {
    id: 7,
    logo_path: '/vru2SssLX3FPhnKZGtYw00pVIS9.png',
    name: 'DreamWorks Pictures',
  },
  {
    id: 9993,
    logo_path: '/2Tc1P3Ac8M479naPp1kYT3izLS5.png',
    name: 'DC Entertainment',
  },
  {
    id: 420,
    logo_path: '/hUzeosd33nzE5MCNsZxCGEKTXaQ.png',
    name: 'Marvel Studios',
  },
  {
    id: 174,
    logo_path: '/ky0xOc5OrhzkZ1N6KyUxacfQsCk.png',
    name: 'Warner Bros. Pictures',
  },
  {
    id: 4,
    logo_path: '/fycMZt242LVjagMByZOLUGbCvv3.png',
    name: 'Paramount',
  },
  {
    id: 34,
    logo_path: '/GagSvqWlyPdkFHMfQ3pNq6ix9P.png',
    name: 'Sony Pictures',
  },
  {
    id: 25,
    logo_path: '/qZCc1lty5FzX30aOCVRBLzaVmcp.png',
    name: '20th Century Fox',
  },
  {
    id: 1632,
    logo_path: '/cisLn1YAUuptXVBa0xjq7ST9cH0.png',
    name: 'Lionsgate',
  },
  {
    id: 21,
    logo_path: '/aOWKh4gkNrfFZ3Ep7n0ckPhoGb5.png',
    name: 'Metro-Goldwyn-Mayer',
  },
];

const Networks = [
  {
    id: 213,
    logo_path: '/wwemzKWzjKYJFfCeiB57q3r4Bcm.png',
    name: 'Netflix',
  },
  {
    id: 2,
    logo_path: '/2uy2ZWcplrSObIyt4x0Y9rkG6qO.png',
    name: 'ABC (US)',
  },
  {
    id: 19,
    logo_path: '/1DSpHrWyOORkL9N2QHX7Adt31mQ.png',
    name: 'FOX (US)',
  },
  {
    id: 453,
    logo_path: '/pqUTCleNUiTLAVlelGxUgWn1ELh.png',
    name: 'Hulu',
  },
  {
    id: 67,
    logo_path: '/Allse9kbjiP6ExaQrnSpIhkurEi.png',
    name: 'Showtime',
  },
  {
    id: 2739,
    logo_path: '/gJ8VX6JSu3ciXHuC2dDGAo2lvwM.png',
    name: 'Disney+',
  },
  {
    id: 64,
    logo_path: '/tmttRFo2OiXQD0EHMxxlw8EzUuZ.png',
    name: 'Discovery',
  },
  {
    id: 49,
    logo_path: '/tuomPhY2UtuPTqqFnKMVHvSb724.png',
    name: 'HBO',
  },
  {
    id: 65,
    logo_path: '/m7iLIC5UfC2Pp60bkjXMWLFrmp6.png',
    name: 'History',
  },
  {
    id: 6,
    logo_path: '/nGRVQlfmPBmfkNgCFpx5m7luTxG.png',
    name: 'NBC',
  },
];

async function trending() {
  logger.verbose(`TMDB Trending lookup`, { label: 'tmdb.trending' });

  let [people, movies, shows]: any = await Promise.all([
    getPerson(),
    getMovies(),
    getShows(),
  ]);

  return {
    people: people,
    movies: movies,
    tv: shows,
    companies: Companies,
    networks: Networks,
  };
}
export default trending;

// Caching Layer

async function getPerson() {
  let data = {};
  try {
    data = await memoryCache.wrap('trending_person', async function () {
      const people = await personData();
      return people.map((person) => {
        return {
          id: person.id,
          name: person.name,
          profile_path: person.profile_path,
        };
      });
    });
  } catch (err) {
    logger.warn(`Error getting trending people`, {
      label: 'tmdb.trending',
    });
    logger.error(err, { label: 'tmdb.trending' });
  }
  return data;
}

async function getMovies() {
  let data = {};
  try {
    data = await memoryCache.wrap('trending_movies', async function () {
      const movies = await moviesData();
      return bluebird.map(movies, async (movie) => {
        return getMovieDetails(movie.id);
      });
    });
  } catch (err) {
    logger.warn(`Error getting trending movies`, {
      label: 'tmdb.trending',
    });
    logger.error(err, { label: 'tmdb.trending' });
  }
  return data;
}

async function getShows() {
  let data = {};
  try {
    data = await memoryCache.wrap('trending_shows', async function () {
      const shows = await showsData();
      return bluebird.map(shows, (show) => {
        return getShowDetails(show.id);
      });
    });
  } catch (err) {
    logger.warn(`Error getting trending shows`, {
      label: 'tmdb.trending',
    });
    logger.error(err, { label: 'tmdb.trending' });
  }
  return data;
}

// Lookup layer

async function personData(): Promise<TrendingPeople[]> {
  logger.verbose('Person from source not cache', {
    label: 'tmdb.trending',
  });
  const data = await TMDBAPI.get('/trending/:media_type/:time_window', {
    params: {
      media_type: MediaType.Person,
      time_window: TimeWindow.Week,
    },
  });
  return data.results as TrendingPeople[];
}

async function moviesData(): Promise<TrendingMovie[]> {
  logger.verbose('Movies from source not cache', {
    label: 'tmdb.trending',
  });
  const data = await TMDBAPI.get('/trending/:media_type/:time_window', {
    params: {
      media_type: MediaType.Movie,
      time_window: TimeWindow.Week,
    },
  });
  return data.results as TrendingMovie[];
}

async function showsData(): Promise<TrendingTv[]> {
  logger.verbose('Shows from source not cache', {
    label: 'tmdb.trending',
  });
  const data = await TMDBAPI.get('/trending/:media_type/:time_window', {
    params: {
      media_type: MediaType.Tv,
      time_window: TimeWindow.Week,
    },
  });
  return data.results as TrendingTv[];
}
