/* eslint-disable no-plusplus */

/* eslint-disable @typescript-eslint/no-use-before-define */
import { getFromContainer } from '@/infrastructure/container/container';
import logger from '@/infrastructure/logger/logger';
import { FilterRepository } from '@/resources/filter/repository';
import { movieLookup } from '@/services/tmdb/movie';
import { showLookup } from '@/services/tmdb/show';

export default async (item) => {
  if (!item.tmdb_id) return false;
  let filterMatch = false;
  let action = {};

  const mediaDetails =
    item.type === 'movie'
      ? await movieLookup(item.tmdb_id)
      : await showLookup(item.tmdb_id);
  const filterId = item.type === 'movie' ? 'movie_filters' : 'tv_filters';
  const filtersResult = await getFromContainer(FilterRepository).findOne({
    id: filterId,
  });
  if (!mediaDetails || filtersResult.isNone()) {
    return false;
  }
  const filters = filtersResult.unwrap();
  let compulsoryPass = true;
  let optionalMatch = 0;
  let hasMatched = false;
  filters.filters.forEach((f, i) => {
    if (f.comparison === 'and' && i > 0) {
      // must match
      filterMatch = filterCompare(
        f.condition,
        f.value,
        f.operator,
        mediaDetails,
      );
      if (filterMatch) {
        hasMatched = true;
      }
      if (!filterMatch) {
        compulsoryPass = false;
      }
    } else {
      // can match
      filterMatch = filterCompare(
        f.condition,
        f.value,
        f.operator,
        mediaDetails,
      );
      if (filterMatch) {
        hasMatched = true;
        optionalMatch++;
      }
    }
    if (
      hasMatched &&
      compulsoryPass &&
      (optionalMatch > 0 || filters.filters.length === 1)
    ) {
      logger.info(`FILT: Match on filter ${i + 1}`, {
        module: 'requests.filter',
      });
      action = filters.actions;
    }
  });

  return action;
};

function filterCompare(condition, value, operator, media) {
  const mediaValues: any = getValue(condition, media);
  let match = false;
  mediaValues.forEach((mediaValue) => {
    switch (operator) {
      case 'equal':
        if (mediaValue === value) match = true;
        break;
      case 'not':
        if (mediaValue !== value) match = true;
        break;
      case 'greater':
        if (mediaValue > value) match = true;
        break;
      case 'less':
        if (mediaValue < value) match = true;
        break;
      default:
        match = false;
    }
  });

  return match;
}

function getValue(condition, media) {
  let values: any = false;
  switch (condition) {
    case 'genre':
      values = [];
      media.genres.forEach((genre) => {
        values.push(genre.id);
      });
      if (media.keywords && Array.isArray(media.keywords)) {
        if (media.keywords) {
          media.keywords.forEach((kw) => {
            if (kw.id === 210024) values.push('anime');
          });
        }
      }
      break;
    case 'year':
      values = [];
      if (media.release_date) {
        values.push(new Date(media.release_date).getFullYear());
      }
      if (media.first_air_date) {
        values.push(new Date(media.first_air_date).getFullYear());
      }
      break;
    case 'age_rating':
      values = [media.age_rating];
      break;
    case 'keyword':
      values = [];
      if (media.keywords && Array.isArray(media.keywords)) {
        media.keywords.forEach((kw) => {
          values.push(kw.name);
        });
      }
      break;
    case 'language':
      values = [];
      if (media.original_language) {
        values.push(media.original_language);
      }
      break;
    case 'popularity':
      values = [];
      if (media.popularity) {
        values.push(media.popularity);
      }
      break;
    case 'network':
      values = [];
      if (media.networks && Array.isArray(media.networks.results))
        media.networks.results.forEach((nw) => {
          values.push(nw.name);
        });
      break;
    case 'studio':
      values = [];
      if (
        media.production_companies &&
        Array.isArray(media.production_companies.results)
      ) {
        media.production_companies.results.forEach((cp) => {
          values.push(cp.name);
        });
      }
      break;
    case 'adult':
      values = [];
      if (media.adult !== undefined) values.push(media.adult);
      break;
    case 'status':
      values = [];
      if (media.status !== undefined) values.push(media.status);
      break;
    default: {
      break;
    }
  }
  return values;
}
