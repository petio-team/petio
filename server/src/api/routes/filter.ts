import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { getFromContainer } from '@/infrastructure/container/container';
import logger from '@/infrastructure/logger/logger';
import { FilterEntity } from '@/resources/filter/entity';
import { FilterRepository } from '@/resources/filter/repository';
import { FilterType } from '@/resources/filter/types';

const getFilters = async (ctx: Context) => {
  try {
    ctx.ok({});
  } catch (err) {
    logger.error(err, 'FILTER: Unable to load filters');
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const updateFilter = async (ctx: Context) => {
  const { body } = ctx.request;

  const movieFilter = body.movie;
  const tvFilter = body.tv;

  const filterRepo = getFromContainer(FilterRepository);
  const existingMovie = await filterRepo.findOne({ id: 'movie_filters' });
  const existingTv = await filterRepo.findOne({ id: 'tv_filters' });

  try {
    if (existingMovie) {
      await filterRepo.updateMany(
        { id: 'movie_filters' },
        {
          $set: {
            data: movieFilter,
          },
        },
      );
      logger.debug('FILTER: Movie Filter updated');
    } else {
      await filterRepo.create(
        FilterEntity.create({
          type: FilterType.MOVIE,
          filters: movieFilter.filters,
          actions: movieFilter.actions,
          collapse: movieFilter.collapse,
        }),
      );
      logger.debug('FILTER: New Movie filter created');
    }
    if (existingTv) {
      await filterRepo.updateMany(
        { id: 'tv_filters' },
        {
          $set: {
            data: tvFilter,
          },
        },
      );
      logger.debug('FILTER: TV Filter updated');
    } else {
      await filterRepo.create(
        FilterEntity.create({
          type: FilterType.SHOW,
          filters: tvFilter.filters,
          actions: tvFilter.actions,
          collapse: tvFilter.collapse,
        }),
      );
      logger.debug('FILTER: New TV filter created');
    }
    logger.info('FILTER: Filters updated');
    ctx.status = StatusCodes.OK;
  } catch (err) {
    logger.error('FILTER: Error saving filters', err);

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const route = new Router({ prefix: '/filter' });
export default (app: Router) => {
  route.get('/', getFilters);
  route.post('/update', updateFilter);

  app.use(route.routes());
  app.use(route.allowedMethods());
};
