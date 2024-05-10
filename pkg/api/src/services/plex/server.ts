import { getFromContainer } from '@/infra/container/container';
import { MovieRepository } from '@/resources/movie/repository';
import { ShowRepository } from '@/resources/show/repository';

export default async (
  type: string,
  imdb?: { toString: () => any },
  tvdb?: { toString: () => any },
  tmdb?: { toString: () => any },
) => {
  const clientId = '';
  if (type === 'movie') {
    let foundItemsImdb: any = false;
    let foundItemsTvdb: any = false;
    let foundItemsTmdb: any = false;
    let found: any = false;
    const movieRepo = getFromContainer(MovieRepository);

    if (imdb) {
      foundItemsImdb = await movieRepo.findAll({
        imdb_id: imdb.toString(),
      });
      found = foundItemsImdb;
    }

    if (tvdb) {
      foundItemsTvdb = await movieRepo.findAll({
        externalId: tvdb.toString(),
      });
      found = foundItemsTvdb;
    }

    if (tmdb) {
      foundItemsTmdb = await movieRepo.findAll({
        tmdb_id: tmdb.toString(),
      });
      found = foundItemsTmdb;
    }

    const resolutions: any = [];

    if (found && found.length > 0) {
      const exists: any = [];
      Object.keys(found).forEach((i) => {
        const item: any = found[i];
        if (item.Media.length > 0) {
          resolutions.push(item.Media[0].videoResolution);
          exists.push({
            ratingKey: item.ratingKey,
            resolution: item.Media[0].videoResolution,
          });
        }
      });
      return {
        exists: {
          versions: exists,
          serverKey: clientId,
        },
        resolutions,
      };
    }
    return { exists: false, resolutions: [] };
  }

  if (type === 'show' || type === 'tv') {
    let foundItemsImdb: any = false;
    let foundItemsTvdb: any = false;
    let foundItemsTmdb: any = false;
    let found: any = false;
    const showRepo = getFromContainer(ShowRepository);

    if (imdb) {
      foundItemsImdb = await showRepo.findAll({
        imdb_id: imdb.toString(),
      });
      found = foundItemsImdb;
    }

    if (tvdb) {
      foundItemsTvdb = await showRepo.findAll({
        tvdb_id: tvdb.toString(),
      });
      found = foundItemsTvdb;
    }

    if (tmdb) {
      foundItemsTmdb = await showRepo.findAll({
        tmdb_id: tmdb.toString(),
      });
      found = foundItemsTmdb;
    }

    if (found && found.length > 0) {
      const exists: any = [];
      const resolutions: any = [];
      Object.keys(found).forEach((i) => {
        const item = found[i];
        const seasons = item.seasonData;
        if (
          seasons &&
          seasons[1] &&
          seasons[1].episodes &&
          seasons[1].episodes[1] &&
          seasons[1].episodes[1].resolution
        ) {
          resolutions.push(seasons[1].episodes[1].resolution);
          exists.push({
            ratingKey: item.ratingKey,
            seasons,
            resolution: seasons[1].episodes[1].resolution,
          });
        } else {
          exists.push({
            ratingKey: item.ratingKey,
            seasons,
            resolution: 'unknown',
          });
        }
      });
      return {
        exists: {
          versions: exists,
          serverKey: clientId,
        },
        resolutions,
      };
    }
  }
  return { exists: false, resolutions: [] };
};
