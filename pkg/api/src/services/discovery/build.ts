import Promise from 'bluebird';
import request from 'xhr-request';

import { config } from '@/config/index';
import logger from '@/loaders/logger';
import Discovery from '@/models/discovery';
import Movie from '@/models/movie';
import Show from '@/models/show';
import { GetAllUsers, User } from '@/models/user';
import MakePlexURL from '@/services/plex/util';

export default async () => {
  logger.verbose('DISC: Started building discovery profiles', {
    label: 'discovery.build',
  });

  try {
    const users = await GetAllUsers();
    if (users.length === 0) {
      logger.verbose('DISC: No Users', { label: 'discovery.build' });
      return;
    }
    const userIds = users.map((user: User) => {
      if (user.altId) {
        return user.altId;
      } else if (!user.custom) {
        return user.id;
      }
    });

    await Promise.map(
      userIds,
      async (i) => {
        await userBuild(i);
      },
      { concurrency: config.get('general.concurrency') },
    );
    logger.verbose('DISC: Finished building discovery profiles', {
      label: 'discovery.build',
    });
  } catch (e) {
    logger.error(e);
  }
  return;
};

function userBuild(id) {
  return new Promise((resolve) => {
    create(id).then(() => resolve());
  });
}

async function create(id) {
  try {
    let data: any = await build(id);
    let existing = await Discovery.findOne({ id: id });
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
      let newDiscover = new Discovery({
        id: id,
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
  } catch (_) {}
  return;
}

async function build(id) {
  let movie: any = {
    history: {},
    genres: {},
    actors: {},
    directors: {},
  };
  let series: any = {
    history: {},
    genres: {},
  };
  let data: any = await getHistory(id);
  if (data.MediaContainer.size === 0) {
    logger.verbose(`DISC: No history for user - ${id}`, {
      label: 'discovery.build',
    });
    return {
      movie: movie,
      series: series,
    };
  }
  let items = data.MediaContainer.Metadata;
  for (let i = 0; i < items.length; i++) {
    let listItem = items[i];
    if (listItem.type === 'movie') {
      let dbItem = await Movie.findOne({ ratingKey: listItem.ratingKey });
      if (dbItem) {
        if (dbItem.tmdb_id) movie.history[dbItem.tmdb_id] = dbItem.tmdb_id;
        if (dbItem.Genre) {
          for (let g = 0; g < dbItem.Genre.length; g++) {
            let genre = dbItem.Genre[g];
            let cr = cert(dbItem.contentRating, 'movie');
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
                let certCount = movie.genres[genre.tag].cert[cr] || 0;
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
          for (let r = 0; r < dbItem.Role.length; r++) {
            let actor = dbItem.Role[r].tag.replace(/[^a-zA-Z0-9 ]/g, '');
            movie.actors[actor] = movie.actors[actor]
              ? movie.actors[actor] + 1
              : 1;
          }
        }

        if (dbItem.Director) {
          for (let r = 0; r < dbItem.Director.length; r++) {
            let director = dbItem.Director[r].tag.replace(/[^a-zA-Z0-9 ]/g, '');
            movie.directors[director] = movie.directors[director]
              ? movie.directors[director] + 1
              : 1;
          }
        }
      }
    } else if (listItem.type === 'episode') {
      if (listItem.grandparentKey) {
        let key = listItem.grandparentKey.replace('/library/metadata/', '');
        let dbItem = await Show.findOne({ ratingKey: key });
        if (dbItem) {
          if (dbItem.tmdb_id) series.history[dbItem.tmdb_id] = dbItem.tmdb_id;
          if (dbItem.Genre) {
            for (let g = 0; g < dbItem.Genre.length; g++) {
              let genre = dbItem.Genre[g];
              let cr = cert(dbItem.contentRating, 'show');
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
                  let certCount = series.genres[genre.tag].cert[cr] || 0;
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
            for (let r = 0; r < dbItem.Role.length; r++) {
              let actor = dbItem.Role[r].tag;
              series.actors[actor] = series.actors[actor]
                ? series.actors[actor] + 1
                : 1;
            }
          }
        }
      }
    }
  }
  Object.keys(movie.actors).map((key) => {
    if (movie.actors[key] < 2) {
      delete movie.actors[key];
    }
  });
  Object.keys(movie.directors).map((key) => {
    if (movie.directors[key] < 2) {
      delete movie.directors[key];
    }
  });
  return {
    movie: movie,
    series: series,
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
      logger.verbose(`DISC: Unmapped Cert Rating - ${cert}`, {
        label: 'discovery.build',
      });
      return false;
  }
}
function getHistory(id, library = false) {
  return new Promise((resolve, reject) => {
    const params = {
      sort: 'viewedAt:desc',
      accountID: id,
      'viewedAt>=': '0',
      'X-Plex-Container-Start': 0,
      'X-Plex-Container-Size': 500,
    };

    if (library) {
      params['librarySectionID'] = library;
    }

    const url = MakePlexURL('/status/sessions/history/all', params);
    request(
      url.toString(),
      {
        method: 'GET',
        json: true,
      },
      function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(data);
      },
    );
  });
}
