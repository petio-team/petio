/* eslint-disable @typescript-eslint/no-use-before-define */

/* eslint-disable no-restricted-syntax */
import { isErrorFromPath } from '@zodios/core';
import Bluebird from 'bluebird';

import { config } from '@/config';
import { PlexAPIClient, PlexApiEndpoints } from '@/infra/plex/plex';
import loggerMain from '@/loaders/logger';
import DiscoveryModel from '@/models/discovery';
import MovieModel, { Movie } from '@/models/movie';
import ShowModel, { Show } from '@/models/show';
import is from '@/utils/is';

type MovieBuild = {
  history: Record<string, string>;
  genres: Record<string, any>;
  actors: Record<string, number>;
  directors: Record<string, number>;
};

type ShowBuild = {
  history: Record<string, string>;
  genres: Record<string, any>;
  actors: Record<string, number>;
};

const logger = loggerMain.child({ module: 'discovery.build' });

export default async (id: string) => {
  try {
    const [data, existing] = await Bluebird.all([
      build(id),
      DiscoveryModel.findOne({ id }).exec(),
    ]);
    if (!is.truthy(data)) {
      logger.debug(`no data for user - ${id}`);
      return;
    }
    if (existing) {
      existing.id = id;
      existing.movie = {
        genres: data.movies.genres,
        people: {
          cast: data.movies.actors,
          director: data.movies.directors,
        },
        history: data.movies.history,
      };
      existing.series = {
        genres: data.shows.genres,
        history: data.shows.history,
        people: {
          cast: data.shows.actors,
          director: {},
        },
      };
      await existing.save();
    } else {
      const newDiscover = new DiscoveryModel({
        id,
        movie: {
          genres: data.movies.genres,
          people: {
            cast: data.movies.actors,
            director: data.movies.directors,
          },
          history: data.movies.history,
        },
        series: {
          genres: data.shows.genres,
          history: data.shows.history,
          people: {
            cast: data.shows.actors,
            director: {},
          },
        },
      });
      await newDiscover.save();
    }
  } catch (e) {
    logger.error(e);
  }
};

function buildMovieGenres(movie: Movie, currentGenres: Record<string, any>) {
  const genres: Record<string, any> = currentGenres;
  const cr = buildCertification(movie.contentRating, 'movie');
  for (const genre of movie.Genre) {
    if (!genres[genre.tag]) {
      genres[genre.tag] = {
        count: 1,
        name: genre.tag,
        cert: {},
        lowestRating: movie.rating ? movie.rating : 0,
        highestRating: movie.rating ? movie.rating : 10,
      };
      if (cr) {
        genres[genre.tag].cert[cr] = 1;
      }
    } else {
      genres[genre.tag].count += 1;
      if (cr) {
        const certCount = genres[genre.tag].cert[cr] || 0;
        genres[genre.tag].cert[cr] = certCount + 1;
      }
      if (movie.rating && genres[genre.tag].lowestRating > movie.rating) {
        genres[genre.tag].lowestRating = movie.rating;
      }
      if (movie.rating && genres[genre.tag].highestRating < movie.rating) {
        genres[genre.tag].highestRating = movie.rating;
      }
    }
  }
  return genres;
}

function buildShowGenres(show: Show, currentGenres: Record<string, any>) {
  const genres: Record<string, any> = currentGenres;
  for (const genre of show.Genre) {
    const cr = buildCertification(show.contentRating, 'show');
    if (!genres[genre.tag]) {
      genres[genre.tag] = {
        count: 1,
        name: genre.tag,
        cert: {},
        lowestRating: show.rating ? show.rating : 0,
        highestRating: show.rating ? show.rating : 10,
      };
      if (cr) {
        genres[genre.tag].cert[cr] = 1;
      }
    } else {
      genres[genre.tag].count += 1;
      if (cr) {
        const certCount = genres[genre.tag].cert[cr] || 0;
        genres[genre.tag].cert[cr] = certCount + 1;
      }
      if (show.rating && genres[genre.tag].lowestRating > show.rating) {
        genres[genre.tag].lowestRating = show.rating;
      }
      if (show.rating && genres[genre.tag].highestRating < show.rating) {
        genres[genre.tag].highestRating = show.rating;
      }
    }
  }
  return genres;
}

type BuildOutput = {
  movies: MovieBuild;
  shows: ShowBuild;
};

async function build(id: string) {
  const output: BuildOutput = {
    movies: {
      history: {},
      genres: {},
      actors: {},
      directors: {},
    },
    shows: {
      history: {},
      genres: {},
      actors: {},
    },
  };
  try {
    const data = await getHistory(id);
    if (!is.truthy(data) || !is.truthy(data.MediaContainer.Metadata)) {
      logger.debug(`no history for user - ${id}`);
      return null;
    }
    const items = data.MediaContainer.Metadata;
    const [movieResults, showResults] = await Bluebird.all([
      Bluebird.filter(items, (i) => i.type === 'movie').map(async (i) =>
        MovieModel.findOne({ ratingKey: i.ratingKey }).exec(),
      ),
      Bluebird.filter(
        items,
        (i) => i.type === 'episode' && is.truthy(i.grandparentKey),
      ).map(async (i) =>
        ShowModel.findOne({
          ratingKey: i.grandparentKey!.replace('/library/metadata/', ''),
        }).exec(),
      ),
    ]);
    const movieResultsFiltered = movieResults.filter(is.truthy);
    const showResultsFiltered = showResults.filter(is.truthy);

    for (const movie of movieResultsFiltered) {
      if (movie.tmdb_id) {
        output.movies.history[movie.tmdb_id] = movie.tmdb_id;
      }

      if (movie.Genre) {
        output.movies.genres = buildMovieGenres(movie, output.movies.genres);
      }

      if (movie.Role) {
        for (const role of movie.Role) {
          const actor = role.tag.replace(/[^a-zA-Z0-9 ]/g, '');
          output.movies.actors[actor] = output.movies.actors[actor]
            ? output.movies.actors[actor] + 1
            : 1;
        }
      }

      if (movie.Director) {
        for (const director of movie.Director) {
          const directorTag = director.tag.replace(/[^a-zA-Z0-9 ]/g, '');
          output.movies.directors[directorTag] = output.movies.directors[
            directorTag
          ]
            ? output.movies.directors[directorTag] + 1
            : 1;
        }
      }
    }

    for (const show of showResultsFiltered) {
      if (show.tmdb_id) {
        output.shows.history[show.tmdb_id] = show.tmdb_id;
      }

      if (show.Genre) {
        output.shows.genres = buildShowGenres(show, output.shows.genres);
      }
    }

    Object.keys(output.movies.actors).forEach((key) => {
      if (output.movies.actors[key] < 2) {
        delete output.movies.actors[key];
      }
    });

    Object.keys(output.movies.directors).forEach((key) => {
      if (output.movies.directors[key] < 2) {
        delete output.movies.directors[key];
      }
    });
    return output;
  } catch (err) {
    logger.error(err, `failed to build discover for user - ${id}`);
  }
  return null;
}

function buildCertification(certification: string, type: string) {
  let cert = certification;
  if (!cert) return false;
  if (cert.includes('/')) {
    [, cert] = cert.split('/');
  }
  cert = cert.toLowerCase();
  switch (cert) {
    case 'u':
    case 'g':
    case 'gp':
    case '0':
    case '1':
    case '2':
    case '3':
    case 'tv-y':
    case 'tv-y7':
    case 'tv-g':
    case 'approved':
    case 'passed':
      if (type === 'movie') return 'G';
      return 'TV-Y';

    case 'pg':
    case 'tv-pg':
    case '6':
    case '7':
      if (type === 'movie') return 'PG';
      return 'TV-PG';

    case '11':
    case '12':
    case 'pg-12':
    case 'pg-13':
    case '12a':
    case 'tv-14':
      if (type === 'movie') return 'PG-13';
      return 'TV-14';

    case '15':
    case '16':
    case '16+':
    case '17':
    case 'r':
      if (type === 'movie') return 'R';
      return 'TV-14';

    case 'nc-17':
    case 'tv-ma':
    case 'm':
    case '18':
      if (type === 'movie') return 'NC-17';
      return 'TV-MA';

    case 'not rated':
    case 'nr':
      return false;

    default:
      logger.debug(`Unmapped Cert Rating - ${cert}`, {
        module: 'discovery.build',
      });
      return false;
  }
}

async function getHistory(id: string, library?: number) {
  const baseurl = `${config.get('plex.protocol')}://${config.get(
    'plex.host',
  )}:${config.get('plex.port')}`;
  const client = PlexAPIClient(baseurl, config.get('plex.token'));
  try {
    const content = await client.get('/status/sessions/history/all', {
      queries: {
        accountID: id,
        sort: 'viewedAt:desc',
        'viewedAt>': 0,
        librarySectionID: library,
      },
    });
    return content;
  } catch (err) {
    if (
      !isErrorFromPath(
        PlexApiEndpoints,
        'get',
        '/status/sessions/history/all',
        err,
      )
    ) {
      logger.error(err.message, `Failed to get history from Plex`);
    }
    return null;
  }
}
