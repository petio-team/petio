/* eslint-disable no-restricted-syntax */
import Promise from 'bluebird';
import request from 'xhr-request';

import { config } from '@/config/index';
import loggerMain from '@/loaders/logger';
import Discovery from '@/models/discovery';
import Movie from '@/models/movie';
import Show from '@/models/show';
import { GetAllUsers, User } from '@/models/user';
import MakePlexURL from '@/services/plex/util';

const logger = loggerMain.core.child({ label: 'discovery.build' });

export default async () => {
  logger.debug('DISC: Started building discovery profiles');

  try {
    const users = await GetAllUsers();
    if (users.length === 0) {
      logger.debug('DISC: No Users');
      return;
    }
    const userIds = users.map((user: User) => {
      if (user.altId) {
        return user.altId;
      }
      if (!user.custom) {
        return user.plexId;
      }

    });

    await Promise.map(
      userIds,
      async (i) => {
        await create(i);
      },
      { concurrency: config.get('general.concurrency') },
    );
    logger.debug('DISC: Finished building discovery profiles');
  } catch (error) {
    logger.error(`failed to create new discovery profiles for users`, error);
  }
};

async function create(id) {
  try {
    const data: any = await build(id);
    const existing: any = await Discovery.findOne({ id }).exec();
    if (existing) {
      existing.id = id;
      existing.movie = {
        genres: data.movie.genres,
        people: {
          cast: data.movie.actors,
          director: data.movie.directors,
        },
        history: data.movie.history,
      };
      existing.series = {
        genres: data.series.genres,
        history: data.series.history,
        people: {
          cast: data.series.actors,
        },
      };
      existing.save();
    } else {
      const newDiscover = new Discovery({
        id,
        movie: {
          genres: data.movie.genres,
          people: {
            cast: data.movie.actors,
            director: data.movie.directors,
          },
          history: data.movie.history,
        },
        series: {
          genres: data.series.genres,
          history: data.series.history,
          people: {
            cast: data.series.actors,
          },
        },
      });
      newDiscover.save();
    }
  } catch (e) {
    logger.error(e);
  }
}

async function build(id) {
  const movie: any = {
    history: {},
    genres: {},
    actors: {},
    directors: {},
  };
  const series: any = {
    history: {},
    genres: {},
  };
  const data: any = await getHistory(id);
  if (data.MediaContainer.size === 0) {
    logger.debug(`DISC: No history for user - ${id}`);
    return {
      movie,
      series,
    };
  }
  const items = data.MediaContainer.Metadata;
  for (const element of items) {
    const listItem = element;
    if (listItem.type === 'movie') {
      const dbItem = await Movie.findOne({
        ratingKey: listItem.ratingKey,
      }).exec();
      if (dbItem) {
        if (dbItem.tmdb_id) movie.history[dbItem.tmdb_id] = dbItem.tmdb_id;
        if (dbItem.Genre) {
          for (const genre of dbItem.Genre) {
            const cr = cert(dbItem.contentRating, 'movie');
            if (!movie.genres[genre.tag]) {
              movie.genres[genre.tag] = {
                count: 1,
                name: genre.tag,
                cert: {},
                lowestRating: dbItem.rating ? dbItem.rating : 0,
                highestRating: dbItem.rating ? dbItem.rating : 10,
              };
              if (cr) movie.genres[genre.tag].cert[cr] = 1;
            } else {
              movie.genres[genre.tag].count = movie.genres[genre.tag].count + 1;
              if (cr) {
                const certCount = movie.genres[genre.tag].cert[cr] || 0;
                movie.genres[genre.tag].cert[cr] = certCount + 1;
              }
              if (
                dbItem.rating &&
                movie.genres[genre.tag].lowestRating > dbItem.rating
              ) {
                movie.genres[genre.tag].lowestRating = dbItem.rating;
              }
              if (
                dbItem.rating &&
                movie.genres[genre.tag].highestRating < dbItem.rating
              ) {
                movie.genres[genre.tag].highestRating = dbItem.rating;
              }
            }
          }
        }
        if (dbItem.Role) {
          for (const role of dbItem.Role) {
            const actor = role.tag.replace(/[^a-zA-Z0-9 ]/g, '');
            movie.actors[actor] = movie.actors[actor]
              ? movie.actors[actor] + 1
              : 1;
          }
        }

        if (dbItem.Director) {
          for (const director of dbItem.Director) {
            const directorTag = director.tag.replace(/[^a-zA-Z0-9 ]/g, '');
            movie.directors[directorTag] = movie.directors[directorTag]
              ? movie.directors[directorTag] + 1
              : 1;
          }
        }
      }
    } else if (listItem.type === 'episode') {
      if (listItem.grandparentKey) {
        const key = listItem.grandparentKey.replace('/library/metadata/', '');
        const dbItem: any = await Show.findOne({ ratingKey: key }).exec();
        if (dbItem) {
          if (dbItem.tmdb_id) series.history[dbItem.tmdb_id] = dbItem.tmdb_id;
          if (dbItem.Genre) {
            // eslint-disable-next-line no-restricted-syntax
            for (const genre of dbItem.Genre) {
              const cr = cert(dbItem.contentRating, 'show');
              if (!series.genres[genre.tag]) {
                series.genres[genre.tag] = {
                  count: 1,
                  name: genre.tag,
                  cert: {},
                  lowestRating: dbItem.rating ? dbItem.rating : 0,
                  highestRating: dbItem.rating ? dbItem.rating : 10,
                };
                if (cr) series.genres[genre.tag].cert[cr] = 1;
              } else {
                series.genres[genre.tag].count =
                  series.genres[genre.tag].count + 1;
                if (cr) {
                  const certCount = series.genres[genre.tag].cert[cr] || 0;
                  series.genres[genre.tag].cert[cr] = certCount + 1;
                }
                if (
                  dbItem.rating &&
                  series.genres[genre.tag].lowestRating > dbItem.rating
                ) {
                  series.genres[genre.tag].lowestRating = dbItem.rating;
                }
                if (
                  dbItem.rating &&
                  series.genres[genre.tag].highestRating < dbItem.rating
                ) {
                  series.genres[genre.tag].highestRating = dbItem.rating;
                }
              }
            }
          }

          if (dbItem.Role) {
            // eslint-disable-next-line no-restricted-syntax
            for (const role of dbItem.Role) {
              const actor = role.tag;
              series.actors[actor] = series.actors[actor]
                ? series.actors[actor] + 1
                : 1;
            }
          }
        }
      }
    }
  }
  Object.keys(movie.actors).forEach((key) => {
    if (movie.actors[key] < 2) {
      delete movie.actors[key];
    }
  });
  Object.keys(movie.directors).forEach((key) => {
    if (movie.directors[key] < 2) {
      delete movie.directors[key];
    }
  });
  return {
    movie,
    series,
  };
}

function cert(cert, type) {
  if (!cert) return false;
  if (cert.includes('/')) cert = cert.split('/')[1];
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
      logger.debug(`DISC: Unmapped Cert Rating - ${cert}`, {
        label: 'discovery.build',
      });
      return false;
  }
}
function getHistory(id, library = false) {
  return new Promise((resolve, reject) => {
    const params: any = {
      sort: 'viewedAt:desc',
      accountID: id,
      'viewedAt>=': '0',
      'X-Plex-Container-Start': 0,
      'X-Plex-Container-Size': 500,
    };

    if (library) {
      params.librarySectionID = library;
    }

    const url = MakePlexURL('/status/sessions/history/all', params);
    request(
      url.toString(),
      {
        method: 'GET',
        json: true,
      },
      (err: any, data: unknown) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      },
    );
  });
}
